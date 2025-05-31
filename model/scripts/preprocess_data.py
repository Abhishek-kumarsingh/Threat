#!/usr/bin/env python3
"""
Script to preprocess raw sensor data for training models
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
import logging

# Add parent directory to path to import from models and utils
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.preprocessing import clean_sensor_data, SensorDataPreprocessor, generate_synthetic_data
from utils.data_processing import load_data, save_data, split_dataset
from config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('preprocess_data.log')
    ]
)

logger = logging.getLogger(__name__)

def preprocess_data(input_file=None, output_dir=None, generate_synthetic=False, n_samples=10000):
    """
    Preprocess data for model training
    
    Parameters:
    - input_file: Path to raw data file (CSV, JSON, etc.)
    - output_dir: Directory to save processed data
    - generate_synthetic: Whether to generate synthetic data
    - n_samples: Number of synthetic samples to generate
    
    Returns:
    - Tuple of (training data path, validation data path, test data path)
    """
    config = Config()
    
    # Use default output directory if not provided
    if output_dir is None:
        output_dir = config.DATA_DIR
    
    # Ensure output directories exist
    training_dir = os.path.join(output_dir, 'training')
    test_dir = os.path.join(output_dir, 'test')
    os.makedirs(training_dir, exist_ok=True)
    os.makedirs(test_dir, exist_ok=True)
    
    # Load or generate data
    if generate_synthetic or input_file is None:
        logger.info(f"Generating {n_samples} synthetic data samples")
        data, labels = generate_synthetic_data(n_samples, include_anomalies=True)
        
        # Add labels column to data
        data['threat_level'] = labels
        
        # Add timestamp column
        now = pd.Timestamp.now()
        data['timestamp'] = pd.date_range(end=now, periods=len(data), freq='5min')
        
    else:
        logger.info(f"Loading data from {input_file}")
        data = load_data(input_file)
        if data is None:
            logger.error("Failed to load data")
            return None, None, None
        
        # Clean the data
        logger.info("Cleaning sensor data")
        data = clean_sensor_data(data)
        
        # Check if threat level column exists
        if 'threat_level' not in data.columns:
            logger.warning("No 'threat_level' column found in data. Creating based on sensor thresholds")
            
            # Create threat level based on thresholds
            data['threat_level'] = 0
            
            # Set threat level to 1 if any gas sensor exceeds its threshold
            mask = (
                (data.get('mq2', 0) > config.THRESHOLD_MQ2) |
                (data.get('mq4', 0) > config.THRESHOLD_MQ4) |
                (data.get('mq6', 0) > config.THRESHOLD_MQ6) |
                (data.get('mq8', 0) > config.THRESHOLD_MQ8) |
                (data.get('temperature', 0) > config.THRESHOLD_TEMP_HIGH)
            )
            data.loc[mask, 'threat_level'] = 1
    
    # Create a preprocessor
    preprocessor = SensorDataPreprocessor()
    
    # Split data into train, validation, and test sets
    logger.info("Splitting data into train, validation, and test sets")
    X_train, X_val, X_test, y_train, y_val, y_test = split_dataset(
        data, 'threat_level', test_size=0.2, val_size=0.1)
    
    # Fit preprocessor only on training data to avoid data leakage
    preprocessor.fit(X_train)
    
    # Transform all datasets
    X_train_processed = preprocessor.transform(X_train)
    X_val_processed = preprocessor.transform(X_val) if X_val is not None else None
    X_test_processed = preprocessor.transform(X_test)
    
    # Convert back to DataFrames with column names
    train_df = pd.DataFrame(X_train_processed, columns=X_train.columns)
    train_df['threat_level'] = y_train.values
    
    test_df = pd.DataFrame(X_test_processed, columns=X_test.columns)
    test_df['threat_level'] = y_test.values
    
    if X_val is not None:
        val_df = pd.DataFrame(X_val_processed, columns=X_val.columns)
        val_df['threat_level'] = y_val.values
    else:
        val_df = None
    
    # Save processed datasets
    train_path = os.path.join(training_dir, 'train.csv')
    save_data(train_df, train_path)
    logger.info(f"Training data saved to {train_path}")
    
    test_path = os.path.join(test_dir, 'test.csv')
    save_data(test_df, test_path)
    logger.info(f"Test data saved to {test_path}")
    
    if val_df is not None:
        val_path = os.path.join(test_dir, 'validation.csv')
        save_data(val_df, val_path)
        logger.info(f"Validation data saved to {val_path}")
    else:
        val_path = None
    
    return train_path, val_path, test_path

def main():
    """Main function for command line usage"""
    parser = argparse.ArgumentParser(description='Preprocess sensor data for model training')
    
    parser.add_argument('--input', '-i', type=str, help='Input data file')
    parser.add_argument('--output_dir', '-o', type=str, help='Output directory')
    parser.add_argument('--synthetic', '-s', action='store_true', help='Generate synthetic data')
    parser.add_argument('--samples', '-n', type=int, default=10000, help='Number of synthetic samples')
    
    args = parser.parse_args()
    
    preprocess_data(args.input, args.output_dir, args.synthetic, args.samples)

if __name__ == '__main__':
    main()
