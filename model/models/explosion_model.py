import os
import joblib
import logging
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExplosionModel:
    def __init__(self, model_path='models/saved/explosion_model.joblib'):
        self.model_path = model_path
        self.model = None

        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded model from {self.model_path}")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                self._create_default_model()
        else:
            logger.warning(f"No model found at {self.model_path}. Creating a default model.")
            self._create_default_model()

    def _create_default_model(self):
        """Create a default model when no trained model is available"""
        try:
            base_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            self.model = MultiOutputRegressor(base_model)

            # Generate synthetic training data
            X_dummy = np.random.rand(100, 2)  # 2 features: gas_concentration and temperature

            # Generate dummy target with 5 outputs (matching the predict method's return values)
            y_dummy = np.random.rand(100, 5)  # 5 outputs: energy_release, fireball_radius, explosion_duration, overpressure, thermal_radiation

            self.model.fit(X_dummy, y_dummy)
            logger.warning("Created a default explosion model with random data. Train with real data ASAP.")

            # Save the default model
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump(self.model, self.model_path)
            logger.info(f"Default model saved to {self.model_path}")

        except Exception as e:
            logger.error(f"Error creating or saving default model: {e}")
            raise

    def predict(self, gas_concentration, temperature):
        try:
            input_data = np.array([[gas_concentration, temperature]])
            prediction = self.model.predict(input_data)[0]

            return {
                "energy_release": float(prediction[0]),
                "fireball_radius": float(prediction[1]),
                "explosion_duration": float(prediction[2]),
                "overpressure": float(prediction[3]),
                "thermal_radiation": float(prediction[4])
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return {}

# Optional: run as script for testing
if __name__ == "__main__":
    model = ExplosionModel()

    # Example prediction
    result = model.predict(gas_concentration=0.7, temperature=650)
    logger.info("Prediction result:")
    logger.info(result)
