#!/usr/bin/env python3
"""
Simplified ML Model Service for Threat Monitoring
This version works without complex dependencies
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import random
import math

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
class Config:
    THRESHOLD_MQ2 = 1000
    THRESHOLD_MQ4 = 1000
    THRESHOLD_MQ6 = 1000
    THRESHOLD_MQ8 = 1000
    THRESHOLD_TEMP_HIGH = 50
    THRESHOLD_TEMP_LOW = 10
    THRESHOLD_HUMIDITY_HIGH = 80
    THRESHOLD_HUMIDITY_LOW = 20
    ZONE_HIGH_THRESHOLD = 0.8
    ZONE_MEDIUM_THRESHOLD = 0.5
    ZONE_LOW_THRESHOLD = 0.2

config = Config()

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

@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint expected by the backend
    Compatible with ThreatPredictionService format
    """
    try:
        data = request.get_json()
        logger.info(f"Received prediction request: {data}")

        # Extract sensor readings
        mq2 = data.get('mq2_reading', 0)
        mq4 = data.get('mq4_reading', 0)
        mq6 = data.get('mq6_reading', 0)
        mq8 = data.get('mq8_reading', 0)
        temperature = data.get('temperature', 20)
        humidity = data.get('humidity', 50)

        # Extract location and wind data
        location = data.get('location', [0, 0])
        lat = location[0] if isinstance(location, list) else location.get('latitude', 0)
        lon = location[1] if isinstance(location, list) else location.get('longitude', 0)
        wind_speed = data.get('wind_speed', 5)
        wind_direction = data.get('wind_direction', 0)

        # Calculate threat level using simple algorithm
        threat_result = calculate_threat_level(mq2, mq4, mq6, mq8, temperature, humidity)
        
        # Generate threat zones if significant threat
        zones = {}
        evacuation_routes = []
        
        if threat_result['risk_score'] > 0.3:
            zones = generate_threat_zones(lat, lon, wind_speed, wind_direction, threat_result['risk_score'])
            evacuation_routes = generate_evacuation_routes(lat, lon, wind_direction)

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

def calculate_threat_level(mq2, mq4, mq6, mq8, temperature, humidity):
    """Calculate threat level based on sensor readings"""
    
    # Check against thresholds for immediate danger
    immediate_danger = (
        mq2 > config.THRESHOLD_MQ2 or
        mq4 > config.THRESHOLD_MQ4 or
        mq6 > config.THRESHOLD_MQ6 or
        mq8 > config.THRESHOLD_MQ8 or
        temperature > config.THRESHOLD_TEMP_HIGH
    )
    
    # Calculate naive risk score
    mq2_norm = min(mq2 / config.THRESHOLD_MQ2, 2.0)
    mq4_norm = min(mq4 / config.THRESHOLD_MQ4, 2.0)
    mq6_norm = min(mq6 / config.THRESHOLD_MQ6, 2.0)
    mq8_norm = min(mq8 / config.THRESHOLD_MQ8, 2.0)
    
    # Temperature factor
    temp_factor = 0.0
    if temperature > config.THRESHOLD_TEMP_HIGH:
        temp_factor = min((temperature - config.THRESHOLD_TEMP_HIGH) / 10.0, 1.0)
    
    # Combine factors
    gas_factor = max(mq2_norm, mq4_norm, mq6_norm, mq8_norm)
    risk_score = 0.7 * gas_factor + 0.3 * temp_factor
    
    # Adjust for immediate danger
    if immediate_danger:
        risk_score = max(risk_score, 0.8)
    
    # Determine risk level
    if risk_score >= config.ZONE_HIGH_THRESHOLD:
        risk_level = "HIGH"
        recommendations = [
            "Evacuate all personnel immediately",
            "Activate emergency response team",
            "Notify authorities"
        ]
    elif risk_score >= config.ZONE_MEDIUM_THRESHOLD:
        risk_level = "MEDIUM"
        recommendations = [
            "Prepare for possible evacuation",
            "Activate monitoring systems",
            "Alert emergency response team"
        ]
    elif risk_score >= config.ZONE_LOW_THRESHOLD:
        risk_level = "LOW"
        recommendations = [
            "Increase monitoring frequency",
            "Check equipment for malfunctions"
        ]
    else:
        risk_level = "SAFE"
        recommendations = ["Continue normal operations"]
    
    return {
        "risk_score": min(max(risk_score, 0.0), 1.0),
        "risk_level": risk_level,
        "recommendations": recommendations,
        "sensor_status": {
            "mq2": "ALERT" if mq2 > config.THRESHOLD_MQ2 else "NORMAL",
            "mq4": "ALERT" if mq4 > config.THRESHOLD_MQ4 else "NORMAL",
            "mq6": "ALERT" if mq6 > config.THRESHOLD_MQ6 else "NORMAL",
            "mq8": "ALERT" if mq8 > config.THRESHOLD_MQ8 else "NORMAL",
            "temperature": "ALERT" if temperature > config.THRESHOLD_TEMP_HIGH else "NORMAL",
            "humidity": "ALERT" if humidity > config.THRESHOLD_HUMIDITY_HIGH else "NORMAL"
        }
    }

def generate_threat_zones(lat, lon, wind_speed, wind_direction, risk_score):
    """Generate threat zones based on location and conditions"""
    zones = {}
    
    # Convert wind direction to radians
    wind_rad = wind_direction * math.pi / 180
    
    # Wind speed factor
    wind_factor = min(wind_speed / 5, 3.0)
    
    # Generate zones based on risk score
    if risk_score > 0.8:
        zones["extreme_danger"] = generate_zone_points(lat, lon, 0.2 * wind_factor, wind_rad)
    if risk_score > 0.6:
        zones["high_danger"] = generate_zone_points(lat, lon, 0.5 * wind_factor, wind_rad)
    if risk_score > 0.4:
        zones["moderate_danger"] = generate_zone_points(lat, lon, 1.0 * wind_factor, wind_rad)
    if risk_score > 0.2:
        zones["low_danger"] = generate_zone_points(lat, lon, 2.0 * wind_factor, wind_rad)
    
    return zones

def generate_zone_points(lat, lon, distance, wind_rad):
    """Generate points for a threat zone"""
    points = []
    
    for angle in range(0, 360, 10):
        angle_rad = angle * math.pi / 180
        
        # Distort shape based on wind direction
        distortion = 1 + 2 * math.cos(angle_rad - wind_rad)
        adjusted_distance = distance * distortion
        
        # Convert to lat/lon
        dlat = adjusted_distance * math.cos(angle_rad) / 111.32
        dlon = adjusted_distance * math.sin(angle_rad) / (111.32 * math.cos(lat * math.pi / 180))
        
        points.append([lat + dlat, lon + dlon])
    
    # Close the loop
    points.append(points[0])
    return points

def generate_evacuation_routes(lat, lon, wind_direction):
    """Generate evacuation routes"""
    routes = []
    wind_rad = wind_direction * math.pi / 180
    
    # Generate routes perpendicular to wind
    for i, angle_offset in enumerate([90, -90, 180]):
        route_angle = wind_rad + (angle_offset * math.pi / 180)
        
        points = []
        for j in range(6):
            distance = j * 0.5  # 0.5 km intervals
            dlat = distance * math.cos(route_angle) / 111.32
            dlon = distance * math.sin(route_angle) / (111.32 * math.cos(lat * math.pi / 180))
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
    """Endpoint to receive and store raw sensor data"""
    try:
        data = request.get_json()
        logger.info(f"Received sensor data: {data}")
        return jsonify({"status": "received"}), 200
    except Exception as e:
        logger.error(f"Error processing sensor data: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting ML Model Service on port {port}")
    app.run(debug=True, host='0.0.0.0', port=port)
