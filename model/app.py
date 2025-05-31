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
    return jsonify({"status": "healthy"}), 200

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
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
