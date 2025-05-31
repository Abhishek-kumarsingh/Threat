from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import json
from models.threat_model import ThreatModel
from models.explosion_model import ExplosionModel
from models.dispersion_model import DispersionModel
from utils.geo_utils import calculate_threat_zone
from utils.visualization import generate_threat_zone_map
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize models
threat_model = ThreatModel()
explosion_model = ExplosionModel()
dispersion_model = DispersionModel()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route('/info', methods=['GET'])
def model_info():
    """Get model information and capabilities"""
    return jsonify({
        "version": "1.0.0",
        "status": "ready",
        "capabilities": [
            "threat_prediction",
            "explosion_modeling",
            "dispersion_analysis",
            "threat_zone_calculation"
        ],
        "sensors_supported": ["mq2", "mq4", "mq6", "mq8", "temperature", "humidity"],
        "last_updated": "2024-01-01"
    }), 200

@app.route('/predict/threat', methods=['POST'])
def predict_threat():
    """
    Endpoint to predict threat level based on sensor data
    Expected JSON format:
    {
        "sensors": {
            "mq2": float,  # LPG, propane, hydrogen
            "mq4": float,  # Methane, CNG
            "mq6": float,  # LPG, propane, isobutane
            "mq8": float,  # Hydrogen
            "temperature": float,  # in Celsius
            "humidity": float,  # percentage
        },
        "location": {
            "latitude": float,
            "longitude": float
        },
        "wind": {
            "speed": float,  # in m/s
            "direction": float  # in degrees from north
        }
    }
    """
    try:
        data = request.get_json()
        logger.info(f"Received prediction request with data: {data}")

        # Extract sensor data
        sensor_data = data.get('sensors', {})
        location_data = data.get('location', {})
        wind_data = data.get('wind', {})

        # Validate input
        required_sensors = ['mq2', 'mq4', 'mq6', 'mq8', 'temperature', 'humidity']
        for sensor in required_sensors:
            if sensor not in sensor_data:
                return jsonify({"error": f"Missing sensor data: {sensor}"}), 400

        if 'latitude' not in location_data or 'longitude' not in location_data:
            return jsonify({"error": "Missing location data"}), 400

        if 'speed' not in wind_data or 'direction' not in wind_data:
            return jsonify({"error": "Missing wind data"}), 400

        # Make predictions
        threat_level = threat_model.predict(
            mq2=sensor_data['mq2'],
            mq4=sensor_data['mq4'],
            mq6=sensor_data['mq6'],
            mq8=sensor_data['mq8'],
            temperature=sensor_data['temperature'],
            humidity=sensor_data['humidity']
        )

        # If threat detected, calculate explosion parameters and dispersion
        if threat_level['risk_score'] > 0.5:
            explosion_params = explosion_model.predict(
                gas_concentration=max(sensor_data['mq2'], sensor_data['mq4'],
                                      sensor_data['mq6'], sensor_data['mq8']),
                temperature=sensor_data['temperature']
            )

            dispersion_result = dispersion_model.predict(
                source_strength=explosion_params['energy_release'],
                wind_speed=wind_data['speed'],
                wind_direction=wind_data['direction'],
                latitude=location_data['latitude'],
                longitude=location_data['longitude']
            )

            # Generate threat zone shapes
            threat_zones = calculate_threat_zone(
                latitude=location_data['latitude'],
                longitude=location_data['longitude'],
                explosion_params=explosion_params,
                dispersion_params=dispersion_result,
                wind_speed=wind_data['speed'],
                wind_direction=wind_data['direction']
            )

            # Generate visualization (optional - can be done client-side)
            map_data = generate_threat_zone_map(
                latitude=location_data['latitude'],
                longitude=location_data['longitude'],
                threat_zones=threat_zones
            )

            response = {
                "threat_level": threat_level,
                "explosion_params": explosion_params,
                "dispersion_params": dispersion_result,
                "threat_zones": threat_zones,
                "map_url": map_data.get('map_url', None)
            }
        else:
            response = {
                "threat_level": threat_level,
                "message": "No significant threat detected"
            }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint expected by the backend
    Compatible with ThreatPredictionService format
    """
    try:
        data = request.get_json()
        logger.info(f"Received prediction request: {data}")

        # Extract sensor readings in the format expected by backend
        sensor_data = {
            'mq2': data.get('mq2_reading', 0),
            'mq4': data.get('mq4_reading', 0),
            'mq6': data.get('mq6_reading', 0),
            'mq8': data.get('mq8_reading', 0),
            'temperature': data.get('temperature', 20),
            'humidity': data.get('humidity', 50)
        }

        # Extract location data
        location = data.get('location', [0, 0])
        location_data = {
            'latitude': location[0] if isinstance(location, list) else location.get('latitude', 0),
            'longitude': location[1] if isinstance(location, list) else location.get('longitude', 0)
        }

        # Extract wind data
        wind_data = {
            'speed': data.get('wind_speed', 5),
            'direction': data.get('wind_direction', 0)
        }

        # Make threat prediction
        threat_result = threat_model.predict(
            mq2=sensor_data['mq2'],
            mq4=sensor_data['mq4'],
            mq6=sensor_data['mq6'],
            mq8=sensor_data['mq8'],
            temperature=sensor_data['temperature'],
            humidity=sensor_data['humidity']
        )

        # If significant threat detected, calculate zones
        zones = {}
        evacuation_routes = []

        if threat_result['risk_score'] > 0.3:
            # Calculate explosion parameters
            explosion_params = explosion_model.predict(
                gas_concentration=max(sensor_data['mq2'], sensor_data['mq4'],
                                    sensor_data['mq6'], sensor_data['mq8']),
                temperature=sensor_data['temperature']
            )

            # Calculate dispersion
            dispersion_result = dispersion_model.predict(
                source_strength=explosion_params.get('energy_release', 1000),
                wind_speed=wind_data['speed'],
                wind_direction=wind_data['direction'],
                latitude=location_data['latitude'],
                longitude=location_data['longitude']
            )

            # Generate threat zones
            zones = calculate_threat_zone(
                latitude=location_data['latitude'],
                longitude=location_data['longitude'],
                explosion_params=explosion_params,
                dispersion_params=dispersion_result,
                wind_speed=wind_data['speed'],
                wind_direction=wind_data['direction']
            )

            # Generate evacuation routes (simplified)
            evacuation_routes = generate_evacuation_routes(
                location_data['latitude'],
                location_data['longitude'],
                wind_data['direction']
            )

        # Format response for backend compatibility
        response = {
            "threat_level": threat_result['risk_level'].lower(),
            "prediction_value": int(threat_result['risk_score'] * 10),
            "confidence": 0.85,
            "zones": zones,
            "evacuation_routes": evacuation_routes,
            "model_version": "1.0.0",
            "is_fallback": False,
            "sensor_status": threat_result.get('sensor_status', {}),
            "recommendations": threat_result.get('recommendations', [])
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

def generate_evacuation_routes(lat, lon, wind_direction):
    """Generate simple evacuation routes"""
    routes = []

    # Convert wind direction to radians
    wind_rad = wind_direction * 3.14159 / 180

    # Generate routes perpendicular to wind direction
    for i, angle_offset in enumerate([90, -90, 180]):
        route_angle = wind_rad + (angle_offset * 3.14159 / 180)

        # Generate route points
        points = []
        for j in range(6):
            distance = j * 0.5  # 0.5 km intervals
            dlat = distance * np.cos(route_angle) / 111.32
            dlon = distance * np.sin(route_angle) / (111.32 * np.cos(lat * 3.14159 / 180))
            points.append([lat + dlat, lon + dlon])

        routes.append({
            "type": "LineString",
            "coordinates": points,
            "safetyLevel": "safe" if i < 2 else "riskyButNecessary",
            "estimatedTimeMinutes": 10 + (i * 5)
        })

    return routes

@app.route('/evacuation-routes', methods=['POST'])
def evacuation_routes():
    """Generate evacuation routes for a given threat zone"""
    try:
        data = request.get_json()

        # Extract location
        if 'source' in data and 'coordinates' in data['source']:
            lat, lon = data['source']['coordinates']
        elif 'location' in data:
            lat, lon = data['location']
        else:
            lat, lon = 0, 0

        # Extract wind direction
        wind_direction = 0
        if 'environmentalFactors' in data:
            wind_direction = data['environmentalFactors'].get('windDirection', 0)
        elif 'wind_direction' in data:
            wind_direction = data['wind_direction']

        routes = generate_evacuation_routes(lat, lon, wind_direction)

        return jsonify({"routes": routes}), 200

    except Exception as e:
        logger.error(f"Error generating evacuation routes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/sensors/data', methods=['POST'])
def receive_sensor_data():
    """Endpoint to receive and store raw sensor data from Arduino"""
    try:
        data = request.get_json()

        # Here you would typically store this data in a database
        # For now, we'll just log it
        logger.info(f"Received sensor data: {data}")

        return jsonify({"status": "received"}), 200

    except Exception as e:
        logger.error(f"Error processing sensor data: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
