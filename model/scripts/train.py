#!/usr/bin/env python3
"""
Script to train the threat prediction model
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
import logging
import joblib

# Add parent directory to path to import from models and utils
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.threat_model import ThreatModel
from models.explosion_model import ExplosionModel
from models.dispersion_model import DispersionModel
from utils.data_processing import load_data
from config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('train.log')
    ]
)

logger = logging.getLogger(__name__)

def train_threat_model(training_data_path, model_output_dir=None):
    """
    Train the threat prediction model
    
    Parameters:
    - training_data_path: Path to training data file
    - model_output_dir: Directory to save trained model
    
    Returns:
    - Trained model
    """
    config = Config()
    
    # Use default model dir if not provided
    if model_output_dir is None:
        model_output_dir = config.MODEL_DIR
    
    # Ensure model directory exists
    os.makedirs(model_output_dir, exist_ok=True)
    
    # Load training data
    logger.info(f"Loading training data from {training_data_path}")
    train_data = load_data(training_data_path)
    if train_data is None:
        logger.error("Failed to load training data")
        return None
    
    # Check if required columns exist
    required_columns = ['mq2', 'mq4', 'mq6', 'mq8', 'temperature', 'humidity', 'threat_level']
    missing_columns = [col for col in required_columns if col not in train_data.columns]
    
    if missing_columns:
        logger.error(f"Missing required columns: {missing_columns}")
        return None
    
    # Separate features and target
    X = train_data.drop(columns=['threat_level'])
    y = train_data['threat_level']
    
    # Create and train the model
    logger.info("Training threat model")
    threat_model = ThreatModel(model_path=os.path.join(model_output_dir, 'threat_model.joblib'))
    threat_model.train(X, y)
    
    logger.info(f"Threat model trained and saved to {os.path.join(model_output_dir, 'threat_model.joblib')}")
    
    return threat_model

def train_explosion_model(training_data_path, model_output_dir=None):
    """
    Train the explosion model
    
    Parameters:
    - training_data_path: Path to training data file
    - model_output_dir: Directory to save trained model
    """
    # In a real application, you would train this model with real explosion data
    # For this example, we'll just create a placeholder model
    
    config = Config()
    
    # Use default model dir if not provided
    if model_output_dir is None:
        model_output_dir = config.MODEL_DIR
    
    # Ensure model directory exists
    os.makedirs(model_output_dir, exist_ok=True)
    
    logger.info("Creating explosion model (placeholder)")
    explosion_model = ExplosionModel(model_path=os.path.join(model_output_dir, 'explosion_model.joblib'))
    
    # We already created a default model in the constructor
    # Just save it explicitly
    if explosion_model.model is not None:
        joblib.dump(explosion_model.model, os.path.join(model_output_dir, 'explosion_model.joblib'))
        logger.info(f"Explosion model saved to {os.path.join(model_output_dir, 'explosion_model.joblib')}")
    
    return explosion_model

def train_dispersion_model(training_data_path, model_output_dir=None):
    """
    Train the gas dispersion model
    
    Parameters:
    - training_data_path: Path to training data file
    - model_output_dir: Directory to save trained model
    """
    # In a real application, you would train this model with real dispersion data
    # For this example, we'll just create a placeholder model
    
    config = Config()
    
    # Use default model dir if not provided
    if model_output_dir is None:
        model_output_dir = config.MODEL_DIR
    
    # Ensure model directory exists
    os.makedirs(model_output_dir, exist_ok=True)
    
    logger.info("Creating dispersion model (placeholder)")
    dispersion_model = DispersionModel(model_path=os.path.join(model_output_dir, 'dispersion_model.joblib'))
    
    # We already created a default model in the constructor
    # Just save it explicitly
    if dispersion_model.model is not None:
        joblib.dump(dispersion_model.model, os.path.join(model_output_dir, 'dispersion_model.joblib'))
        logger.info(f"Dispersion model saved to {os.path.join(model_output_dir, 'dispersion_model.joblib')}")
    
    return dispersion_model

def main():
    """Main function for command line usage"""
    parser = argparse.ArgumentParser(description='Train threat prediction models')
    
    parser.add_argument('--training_data', '-t', type=str, required=True,
                      help='Path to training data file')
    parser.add_argument('--model_output_dir', '-o', type=str,
                      help='Directory to save trained models')
    parser.add_argument('--model_type', '-m', type=str, choices=['threat', 'explosion', 'dispersion', 'all'],
                      default='all', help='Type of model to train')
    
    args = parser.parse_args()
    
    if args.model_type == 'threat' or args.model_type == 'all':
        train_threat_model(args.training_data, args.model_output_dir)
    
    if args.model_type == 'explosion' or args.model_type == 'all':
        train_explosion_model(args.training_data, args.model_output_dir)
    
    if args.model_type == 'dispersion' or args.model_type == 'all':
        train_dispersion_model(args.training_data, args.model_output_dir)

if __name__ == '__main__':
    main()
