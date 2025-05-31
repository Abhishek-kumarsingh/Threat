import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import logging

logger = logging.getLogger(__name__)

class SensorDataPreprocessor:
    """Class to preprocess sensor data for model training and prediction"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.imputer = SimpleImputer(strategy='mean')
        self.fitted = False
    
    def fit(self, data):
        """
        Fit the preprocessor to training data
        
        Parameters:
        - data: DataFrame with sensor readings (mq2, mq4, mq6, mq8, temperature, humidity)
        """
        try:
            # Fill missing values
            self.imputer.fit(data)
            imputed_data = self.imputer.transform(data)
            
            # Normalize data
            self.scaler.fit(imputed_data)
            self.fitted = True
            
            logger.info("Preprocessor fitted successfully")
            return True
        except Exception as e:
            logger.error(f"Error fitting preprocessor: {str(e)}")
            return False
    
    def transform(self, data):
        """
        Transform data using fitted preprocessor
        
        Parameters:
        - data: DataFrame or array with sensor readings
        
        Returns:
        - Preprocessed data array
        """
        if not self.fitted:
            logger.warning("Preprocessor not fitted yet, using raw data")
            return np.array(data)
        
        try:
            # Fill missing values
            imputed_data = self.imputer.transform(data)
            
            # Normalize data
            transformed_data = self.scaler.transform(imputed_data)
            
            return transformed_data
        except Exception as e:
            logger.error(f"Error transforming data: {str(e)}")
            return np.array(data)
    
    def fit_transform(self, data):
        """
        Fit to data, then transform it
        
        Parameters:
        - data: DataFrame with sensor readings
        
        Returns:
        - Preprocessed data array
        """
        self.fit(data)
        return self.transform(data)
    
    def inverse_transform(self, data):
        """
        Reverse the transformation to get original scale
        
        Parameters:
        - data: Transformed data array
        
        Returns:
        - Data array in original scale
        """
        if not self.fitted:
            logger.warning("Preprocessor not fitted yet, returning raw data")
            return np.array(data)
        
        try:
            return self.scaler.inverse_transform(data)
        except Exception as e:
            logger.error(f"Error inverse transforming data: {str(e)}")
            return np.array(data)


def clean_sensor_data(data):
    """
    Clean raw sensor data by removing outliers and invalid values
    
    Parameters:
    - data: DataFrame with sensor readings
    
    Returns:
    - Cleaned DataFrame
    """
    # Make a copy to avoid modifying the original
    df = data.copy()
    
    # Define plausible ranges for each sensor
    valid_ranges = {
        'mq2': (0, 10000),  # ppm
        'mq4': (0, 10000),  # ppm
        'mq6': (0, 10000),  # ppm
        'mq8': (0, 10000),  # ppm
        'temperature': (-50, 100),  # Celsius
        'humidity': (0, 100)  # percentage
    }
    
    # Replace out-of-range values with NaN
    for column, (min_val, max_val) in valid_ranges.items():
        if column in df.columns:
            mask = (df[column] < min_val) | (df[column] > max_val)
            df.loc[mask, column] = np.nan
            logger.info(f"Removed {mask.sum()} invalid values from {column}")
    
    # Remove rows with too many NaNs (more than half of columns)
    threshold = len(df.columns) // 2
    df = df.dropna(thresh=threshold)
    
    # For remaining NaNs, fill with median of column
    df = df.fillna(df.median())
    
    return df


def generate_synthetic_data(n_samples=1000, include_anomalies=True, anomaly_ratio=0.1):
    """
    Generate synthetic sensor data for model development
    
    Parameters:
    - n_samples: Number of samples to generate
    - include_anomalies: Whether to include anomalous readings
    - anomaly_ratio: Percentage of samples that should be anomalous
    
    Returns:
    - DataFrame with synthetic sensor data
    - Series with labels (0 for normal, 1 for anomalous)
    """
    # Base parameters for normal conditions
    normal_params = {
        'mq2': {'mean': 500, 'std': 100},
        'mq4': {'mean': 300, 'std': 80},
        'mq6': {'mean': 400, 'std': 90},
        'mq8': {'mean': 200, 'std': 50},
        'temperature': {'mean': 25, 'std': 5},
        'humidity': {'mean': 60, 'std': 10}
    }
    
    # Parameters for anomalous conditions
    anomaly_params = {
        'mq2': {'mean': 2000, 'std': 500},
        'mq4': {'mean': 1500, 'std': 400},
        'mq6': {'mean': 1800, 'std': 450},
        'mq8': {'mean': 1000, 'std': 300},
        'temperature': {'mean': 60, 'std': 10},
        'humidity': {'mean': 30, 'std': 15}
    }
    
    # Calculate number of normal and anomalous samples
    n_anomalies = int(n_samples * anomaly_ratio) if include_anomalies else 0
    n_normal = n_samples - n_anomalies
    
    # Generate normal data
    normal_data = {}
    for sensor, params in normal_params.items():
        normal_data[sensor] = np.random.normal(
            params['mean'], params['std'], n_normal)
    
    normal_df = pd.DataFrame(normal_data)
    normal_labels = pd.Series([0] * n_normal)
    
    # If no anomalies requested, return normal data
    if n_anomalies == 0:
        return normal_df, normal_labels
    
    # Generate anomalous data
    anomaly_data = {}
    for sensor, params in anomaly_params.items():
        anomaly_data[sensor] = np.random.normal(
            params['mean'], params['std'], n_anomalies)
    
    anomaly_df = pd.DataFrame(anomaly_data)
    anomaly_labels = pd.Series([1] * n_anomalies)
    
    # Combine normal and anomalous data
    combined_df = pd.concat([normal_df, anomaly_df], ignore_index=True)
    combined_labels = pd.concat([normal_labels, anomaly_labels], ignore_index=True)
    
    # Shuffle the data
    idx = np.random.permutation(len(combined_df))
    shuffled_df = combined_df.iloc[idx].reset_index(drop=True)
    shuffled_labels = combined_labels.iloc[idx].reset_index(drop=True)
    
    return shuffled_df, shuffled_labels
