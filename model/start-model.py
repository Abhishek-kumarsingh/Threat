#!/usr/bin/env python3
"""
Startup script for the ML Model Service
This script ensures all models are loaded and the service is ready
"""

import os
import sys
import logging
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from models.threat_model import ThreatModel
from models.explosion_model import ExplosionModel
from models.dispersion_model import DispersionModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_model_files():
    """Check if model files exist, create dummy ones if needed"""
    model_dir = Path("models/saved")
    model_dir.mkdir(parents=True, exist_ok=True)
    
    model_files = [
        "threat_model.joblib",
        "explosion_model.joblib", 
        "dispersion_model.joblib",
        "preprocessor.joblib"
    ]
    
    for model_file in model_files:
        model_path = model_dir / model_file
        if not model_path.exists():
            logger.warning(f"Model file {model_file} not found. Service will use default models.")
    
    return True

def initialize_models():
    """Initialize all ML models"""
    try:
        logger.info("Initializing ML models...")
        
        # Initialize models (they will create default models if files don't exist)
        threat_model = ThreatModel()
        explosion_model = ExplosionModel()
        dispersion_model = DispersionModel()
        
        logger.info("All models initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error initializing models: {str(e)}")
        return False

def main():
    """Main startup function"""
    logger.info("Starting ML Model Service...")
    
    # Check model files
    if not check_model_files():
        logger.error("Model file check failed")
        sys.exit(1)
    
    # Initialize models
    if not initialize_models():
        logger.error("Model initialization failed")
        sys.exit(1)
    
    # Get port from environment
    port = int(os.environ.get('PORT', 5001))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting Flask app on {host}:{port}")
    
    # Start the Flask application
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )

if __name__ == '__main__':
    main()
