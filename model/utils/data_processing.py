import numpy as np
import pandas as pd
import os
import json
from sklearn.model_selection import train_test_split
import logging
from config import Config

logger = logging.getLogger(__name__)

def load_data(file_path):
    """
    Load data from various file formats
    
    Parameters:
    - file_path: Path to the data file
    
    Returns:
    - DataFrame with loaded data
    """
    _, ext = os.path.splitext(file_path)
    
    try:
        if ext.lower() == '.csv':
            return pd.read_csv(file_path)
        elif ext.lower() == '.json':
            return pd.read_json(file_path)
        elif ext.lower() == '.xlsx' or ext.lower() == '.xls':
            return pd.read_excel(file_path)
        elif ext.lower() == '.parquet':
            return pd.read_parquet(file_path)
        else:
            logger.error(f"Unsupported file format: {ext}")
            return None
    except Exception as e:
        logger.error(f"Error loading data from {file_path}: {str(e)}")
        return None

def save_data(data, file_path):
    """
    Save data to file
    
    Parameters:
    - data: DataFrame to save
    - file_path: Path to save the data to
    
    Returns:
    - True if successful, False otherwise
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        _, ext = os.path.splitext(file_path)
        
        if ext.lower() == '.csv':
            data.to_csv(file_path, index=False)
        elif ext.lower() == '.json':
            data.to_json(file_path, orient='records')
        elif ext.lower() == '.xlsx':
            data.to_excel(file_path, index=False)
        elif ext.lower() == '.parquet':
            data.to_parquet(file_path, index=False)
        else:
            logger.error(f"Unsupported file format: {ext}")
            return False
        
        logger.info(f"Data saved successfully to {file_path}")
        return True
    except Exception as e:
        logger.error(f"Error saving data to {file_path}: {str(e)}")
        return False

def split_dataset(data, target_column, test_size=0.2, val_size=0.1, random_state=42):
    """
    Split dataset into training, validation, and test sets
    
    Parameters:
    - data: DataFrame with features and target
    - target_column: Name of the target column
    - test_size: Proportion of data for test set
    - val_size: Proportion of data for validation set
    - random_state: Random state for reproducibility
    
    Returns:
    - X_train, X_val, X_test, y_train, y_val, y_test
    """
    try:
        X = data.drop(columns=[target_column])
        y = data[target_column]
        
        # First split: separate test set
        X_train_val, X_test, y_train_val, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state)
        
        # Second split: separate validation set from training set
        if val_size > 0:
            val_ratio = val_size / (1 - test_size)  # Adjust for the percentage of the remaining data
            X_train, X_val, y_train, y_val = train_test_split(
                X_train_val, y_train_val, test_size=val_ratio, random_state=random_state)
            
            return X_train, X_val, X_test, y_train, y_val, y_test
        else:
            return X_train_val, None, X_test, y_train_val, None, y_test
    
    except Exception as e:
        logger.error(f"Error splitting dataset: {str(e)}")
        return None, None, None, None, None, None

def parse_arduino_data(serial_data):
    """
    Parse data coming from Arduino sensors
    
    Expected format: 
    "MQ2:123,MQ4:456,MQ6:789,MQ8:012,TEMP:25.5,HUM:60.2,LAT:37.7749,LON:-122.4194"
    
    Parameters:
    - serial_data: String data from Arduino
    
    Returns:
    - Dictionary with parsed values
    """
    try:
        data = {}
        
        # Split by comma to get individual readings
        readings = serial_data.strip().split(',')
        
        for reading in readings:
            # Split by colon to separate key and value
            key_value = reading.split(':')
            if len(key_value) == 2:
                key, value = key_value
                
                # Convert to appropriate types
                if key in ['MQ2', 'MQ4', 'MQ6', 'MQ8']:
                    # Gas sensors in ppm
                    data[key.lower()] = float(value)
                elif key == 'TEMP':
                    # Temperature in Celsius
                    data['temperature'] = float(value)
                elif key == 'HUM':
                    # Humidity in percentage
                    data['humidity'] = float(value)
                elif key == 'LAT':
                    # Latitude
                    data['latitude'] = float(value)
                elif key == 'LON':
                    # Longitude
                    data['longitude'] = float(value)
        
        return data
    
    except Exception as e:
        logger.error(f"Error parsing Arduino data: {str(e)}")
        return {}

def generate_synthetic_arduino_data(n_samples=100, include_anomalies=True):
    """
    Generate synthetic Arduino sensor data for testing
    
    Parameters:
    - n_samples: Number of samples to generate
    - include_anomalies: Whether to include anomalous readings
    
    Returns:
    - List of dictionaries with synthetic sensor readings
    """
    data = []
    
    # Base parameters for normal conditions
    normal_params = {
        'mq2': {'mean': 500, 'std': 100},
        'mq4': {'mean': 300, 'std': 80},
        'mq6': {'mean': 400, 'std': 90},
        'mq8': {'mean': 200, 'std': 50},
        'temperature': {'mean': 25, 'std': 5},
        'humidity': {'mean': 60, 'std': 10},
        'latitude': {'mean': 28.6139, 'std': 0.01},  # Example: Delhi, India
        'longitude': {'mean': 77.2090, 'std': 0.01}
    }
    
    # Generate normal samples
    for i in range(n_samples):
        sample = {}
        
        # Decide if this sample should be anomalous
        is_anomalous = include_anomalies and (np.random.random() < 0.1)
        
        for key, params in normal_params.items():
            # Generate value based on normal distribution
            value = np.random.normal(params['mean'], params['std'])
            
            # If anomalous, increase gas readings
            if is_anomalous and key in ['mq2', 'mq4', 'mq6', 'mq8']:
                value *= 3 + np.random.random()  # 3-4x higher
            
            # If anomalous, increase temperature
            if is_anomalous and key == 'temperature':
                value += 20 + 10 * np.random.random()  # 20-30 degrees higher
            
            sample[key] = float(value)
            
        # Add timestamp
        sample['timestamp'] = pd.Timestamp.now() - pd.Timedelta(seconds=(n_samples-i)*5)
        
        data.append(sample)
    
    return data

def sample_to_arduino_format(sample):
    """
    Convert a sample dictionary to Arduino format string
    
    Parameters:
    - sample: Dictionary with sensor readings
    
    Returns:
    - String in Arduino format
    """
    parts = []
    
    if 'mq2' in sample:
        parts.append(f"MQ2:{sample['mq2']:.2f}")
    if 'mq4' in sample:
        parts.append(f"MQ4:{sample['mq4']:.2f}")
    if 'mq6' in sample:
        parts.append(f"MQ6:{sample['mq6']:.2f}")
    if 'mq8' in sample:
        parts.append(f"MQ8:{sample['mq8']:.2f}")
    if 'temperature' in sample:
        parts.append(f"TEMP:{sample['temperature']:.2f}")
    if 'humidity' in sample:
        parts.append(f"HUM:{sample['humidity']:.2f}")
    if 'latitude' in sample:
        parts.append(f"LAT:{sample['latitude']:.6f}")
    if 'longitude' in sample:
        parts.append(f"LON:{sample['longitude']:.6f}")
    
    return ','.join(parts)
