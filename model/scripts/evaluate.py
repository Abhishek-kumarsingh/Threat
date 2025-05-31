#!/usr/bin/env python3
"""
Script to evaluate the trained threat prediction model
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np
import logging
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score, roc_curve
)
import matplotlib.pyplot as plt
import seaborn as sns

# Add parent directory to path to import from models and utils
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.threat_model import ThreatModel
from utils.data_processing import load_data
from config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('evaluate.log')
    ]
)

logger = logging.getLogger(__name__)

def evaluate_model(model_path, test_data_path, output_dir=None):
    """
    Evaluate a trained threat prediction model
    
    Parameters:
    - model_path: Path to the trained model
    - test_data_path: Path to test data
    - output_dir: Directory to save evaluation results
    
    Returns:
    - Dictionary with evaluation metrics
    """
    config = Config()
    
    # Use default output directory if not provided
    if output_dir is None:
        output_dir = os.path.join(config.DATA_DIR, 'evaluation')
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Load test data
    logger.info(f"Loading test data from {test_data_path}")
    test_data = load_data(test_data_path)
    if test_data is None:
        logger.error("Failed to load test data")
        return None
    
    # Check if required columns exist
    required_columns = ['mq2', 'mq4', 'mq6', 'mq8', 'temperature', 'humidity', 'threat_level']
    missing_columns = [col for col in required_columns if col not in test_data.columns]
    
    if missing_columns:
        logger.error(f"Missing required columns: {missing_columns}")
        return None
    
    # Separate features and target
    X_test = test_data.drop(columns=['threat_level'])
    y_test = test_data['threat_level']
    
    # Load model
    logger.info(f"Loading model from {model_path}")
    model = ThreatModel(model_path=model_path)
    
    # Make predictions
    predictions = []
    scores = []
    
    logger.info("Making predictions")
    for _, row in X_test.iterrows():
        result = model.predict(
            row['mq2'], row['mq4'], row['mq6'], row['mq8'], 
            row['temperature'], row['humidity']
        )
        # Convert risk score to binary prediction using threshold
        prediction = 1 if result['risk_score'] >= config.ZONE_MEDIUM_THRESHOLD else 0
        predictions.append(prediction)
        scores.append(result['risk_score'])
    
    # Calculate metrics
    logger.info("Calculating evaluation metrics")
    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, zero_division=0)
    recall = recall_score(y_test, predictions, zero_division=0)
    f1 = f1_score(y_test, predictions, zero_division=0)
    
    try:
        roc_auc = roc_auc_score(y_test, scores)
    except ValueError as e:
        logger.warning(f"Could not calculate ROC AUC: {str(e)}")
        roc_auc = None
    
    # Create confusion matrix
    cm = confusion_matrix(y_test, predictions)
    
    # Print classification report
    report = classification_report(y_test, predictions)
    logger.info(f"Classification Report:\n{report}")
    
    # Generate confusion matrix plot
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=['Safe', 'Threat'],
                yticklabels=['Safe', 'Threat'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.tight_layout()
    
    cm_path = os.path.join(output_dir, 'confusion_matrix.png')
    plt.savefig(cm_path)
    logger.info(f"Confusion matrix saved to {cm_path}")
    
    # Generate ROC curve if possible
    if roc_auc is not None:
        plt.figure(figsize=(8, 6))
        fpr, tpr, _ = roc_curve(y_test, scores)
        plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic')
        plt.legend(loc="lower right")
        plt.tight_layout()
        
        roc_path = os.path.join(output_dir, 'roc_curve.png')
        plt.savefig(roc_path)
        logger.info(f"ROC curve saved to {roc_path}")
    
    # Create results dictionary
    results = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'roc_auc': float(roc_auc) if roc_auc is not None else None,
        'confusion_matrix': cm.tolist(),
        'classification_report': report
    }
    
    # Save results to JSON
    import json
    results_path = os.path.join(output_dir, 'evaluation_results.json')
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=4)
    
    logger.info(f"Evaluation results saved to {results_path}")
    
    return results

def main():
    """Main function for command line usage"""
    parser = argparse.ArgumentParser(description='Evaluate trained threat prediction model')
    
    parser.add_argument('--model', '-m', type=str, required=True,
                      help='Path to the trained model')
    parser.add_argument('--test_data', '-t', type=str, required=True,
                      help='Path to test data file')
    parser.add_argument('--output_dir', '-o', type=str,
                      help='Directory to save evaluation results')
    
    args = parser.parse_args()
    
    evaluate_model(args.model, args.test_data, args.output_dir)

if __name__ == '__main__':
    main()
