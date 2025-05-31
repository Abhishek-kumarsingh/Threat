import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
import logging
from config import Config

logger = logging.getLogger(__name__)

class ThreatModel:
    """Model to predict threat level based on sensor readings"""
    
    def __init__(self, model_path=None):
        """Initialize the threat prediction model"""
        self.model = None
        self.config = Config()
        self.model_path = model_path or os.path.join(Config.MODEL_DIR, 'threat_model.joblib')
        
        # Try to load pre-trained model
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded existing threat model from {self.model_path}")
            else:
                logger.warning(f"No pre-trained model found at {self.model_path}, creating a default model")
                self._create_default_model()
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self._create_default_model()
    
    def _create_default_model(self):
        """Create a default model when no trained model is available"""
        # This is just a placeholder. In a real scenario, you'd want to train this properly.
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # With no training data, we'll just fit with some dummy data
        # This will allow the system to run, but predictions won't be meaningful
        X_dummy = np.random.rand(100, 6)  # 6 features (MQ2, MQ4, MQ6, MQ8, temp, humidity)
        y_dummy = np.random.randint(0, 2, 100)  # Binary classification
        self.model.fit(X_dummy, y_dummy)
        logger.warning("Created a default model with random data. Train with real data as soon as possible.")
    
    def predict(self, mq2, mq4, mq6, mq8, temperature, humidity):
        """
        Predict threat level based on sensor readings
        
        Parameters:
        - mq2: LPG, propane, hydrogen reading
        - mq4: Methane, CNG reading
        - mq6: LPG, propane, isobutane reading 
        - mq8: Hydrogen reading
        - temperature: Temperature in Celsius
        - humidity: Humidity percentage
        
        Returns:
        - Dictionary containing risk score, classification, and recommended actions
        """
        # Prepare input data
        X = np.array([[mq2, mq4, mq6, mq8, temperature, humidity]])
        
        # Check against thresholds for immediate danger
        immediate_danger = (
            mq2 > self.config.THRESHOLD_MQ2 or
            mq4 > self.config.THRESHOLD_MQ4 or
            mq6 > self.config.THRESHOLD_MQ6 or
            mq8 > self.config.THRESHOLD_MQ8 or
            temperature > self.config.THRESHOLD_TEMP_HIGH
        )
        
        # Get model prediction
        if self.model:
            risk_score = float(self.model.predict_proba(X)[0, 1])  # Probability of the positive class
        else:
            # If model isn't available, calculate a naive risk score
            risk_score = self._calculate_naive_risk(mq2, mq4, mq6, mq8, temperature, humidity)
            
        # Adjust risk score if immediate danger is detected
        if immediate_danger:
            risk_score = max(risk_score, 0.8)
        
        # Determine risk level and recommendations
        if risk_score >= self.config.ZONE_HIGH_THRESHOLD:
            risk_level = "HIGH"
            recommendations = [
                "Evacuate all personnel immediately",
                "Activate emergency response team",
                "Notify authorities",
                "Implement full shutdown procedures"
            ]
        elif risk_score >= self.config.ZONE_MEDIUM_THRESHOLD:
            risk_level = "MEDIUM"
            recommendations = [
                "Prepare for possible evacuation",
                "Activate monitoring systems",
                "Alert emergency response team",
                "Begin controlled shutdown of non-essential operations"
            ]
        elif risk_score >= self.config.ZONE_LOW_THRESHOLD:
            risk_level = "LOW"
            recommendations = [
                "Increase monitoring frequency",
                "Check equipment for malfunctions",
                "Verify ventilation systems are functioning",
                "Prepare contingency plans"
            ]
        else:
            risk_level = "SAFE"
            recommendations = [
                "Continue normal operations",
                "Maintain regular monitoring"
            ]
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "recommendations": recommendations,
            "sensor_status": {
                "mq2": "ALERT" if mq2 > self.config.THRESHOLD_MQ2 else "NORMAL",
                "mq4": "ALERT" if mq4 > self.config.THRESHOLD_MQ4 else "NORMAL",
                "mq6": "ALERT" if mq6 > self.config.THRESHOLD_MQ6 else "NORMAL",
                "mq8": "ALERT" if mq8 > self.config.THRESHOLD_MQ8 else "NORMAL",
                "temperature": "ALERT" if temperature > self.config.THRESHOLD_TEMP_HIGH or 
                                         temperature < self.config.THRESHOLD_TEMP_LOW else "NORMAL",
                "humidity": "ALERT" if humidity > self.config.THRESHOLD_HUMIDITY_HIGH or 
                                     humidity < self.config.THRESHOLD_HUMIDITY_LOW else "NORMAL"
            }
        }
    
    def _calculate_naive_risk(self, mq2, mq4, mq6, mq8, temperature, humidity):
        """Calculate a naive risk score based on sensor thresholds"""
        # Normalize each reading relative to its threshold
        mq2_norm = min(mq2 / self.config.THRESHOLD_MQ2, 2.0)
        mq4_norm = min(mq4 / self.config.THRESHOLD_MQ4, 2.0)
        mq6_norm = min(mq6 / self.config.THRESHOLD_MQ6, 2.0)
        mq8_norm = min(mq8 / self.config.THRESHOLD_MQ8, 2.0)
        
        # Temperature factor - increases risk when temperature is high
        temp_factor = 0.0
        if temperature > self.config.THRESHOLD_TEMP_HIGH:
            temp_factor = min((temperature - self.config.THRESHOLD_TEMP_HIGH) / 10.0, 1.0)
        
        # Combine factors with weights
        gas_factor = max(mq2_norm, mq4_norm, mq6_norm, mq8_norm)
        risk_score = 0.7 * gas_factor + 0.3 * temp_factor
        
        return min(max(risk_score, 0.0), 1.0)  # Ensure it's between 0 and 1
    
    def train(self, X, y):
        """
        Train the threat model with new data
        
        Parameters:
        - X: Features (sensor readings)
        - y: Labels (0 for safe, 1 for threat)
        """
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Save the trained model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        logger.info(f"Model trained and saved to {self.model_path}")
        
        return self.model
