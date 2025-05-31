import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # General configuration
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    
    # Model parameters
    MODEL_VERSION = os.environ.get('MODEL_VERSION', '1.0.0')
    
    # Gas thresholds in ppm (parts per million)
    THRESHOLD_MQ2 = float(os.environ.get('THRESHOLD_MQ2', '1000'))  # LPG, Propane threshold
    THRESHOLD_MQ4 = float(os.environ.get('THRESHOLD_MQ4', '1000'))  # Methane threshold
    THRESHOLD_MQ6 = float(os.environ.get('THRESHOLD_MQ6', '1000'))  # LPG threshold
    THRESHOLD_MQ8 = float(os.environ.get('THRESHOLD_MQ8', '1000'))  # Hydrogen threshold
    
    # Temperature thresholds in Celsius
    THRESHOLD_TEMP_LOW = float(os.environ.get('THRESHOLD_TEMP_LOW', '10'))
    THRESHOLD_TEMP_HIGH = float(os.environ.get('THRESHOLD_TEMP_HIGH', '50'))
    
    # Humidity thresholds in percentage
    THRESHOLD_HUMIDITY_LOW = float(os.environ.get('THRESHOLD_HUMIDITY_LOW', '20'))
    THRESHOLD_HUMIDITY_HIGH = float(os.environ.get('THRESHOLD_HUMIDITY_HIGH', '80'))
    
    # Threat zone parameters
    ZONE_HIGH_THRESHOLD = float(os.environ.get('ZONE_HIGH_THRESHOLD', '0.8'))
    ZONE_MEDIUM_THRESHOLD = float(os.environ.get('ZONE_MEDIUM_THRESHOLD', '0.5'))
    ZONE_LOW_THRESHOLD = float(os.environ.get('ZONE_LOW_THRESHOLD', '0.2'))
    
    # Geospatial parameters
    DEFAULT_PROJECTION = os.environ.get('DEFAULT_PROJECTION', 'EPSG:4326')
    
    # File paths
    DATA_DIR = os.environ.get('DATA_DIR', 'data')
    MODEL_DIR = os.environ.get('MODEL_DIR', 'models/saved')
    HISTORICAL_DATA_DIR = os.path.join(DATA_DIR, 'historical')
    TRAINING_DATA_DIR = os.path.join(DATA_DIR, 'training')
    TEST_DATA_DIR = os.path.join(DATA_DIR, 'test')

    # Arduino sensor settings
    ARDUINO_PORT = os.environ.get('ARDUINO_PORT', '/dev/ttyUSB0')
    ARDUINO_BAUDRATE = int(os.environ.get('ARDUINO_BAUDRATE', '9600'))
