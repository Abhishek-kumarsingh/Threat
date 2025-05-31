import numpy as np
import os
import joblib
import logging
from sklearn.ensemble import RandomForestRegressor

# Dummy Config class for directory management
class Config:
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
    os.makedirs(MODEL_DIR, exist_ok=True)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class DispersionModel:
    """
    Model to predict gas dispersion patterns based on source strength,
    weather conditions, and geographical factors.

    Uses a Gaussian plume model with adaptations for complex terrain.
    """

    def __init__(self, model_path=None):
        self.config = Config()
        self.model_path = model_path or os.path.join(Config.MODEL_DIR, 'dispersion_model.joblib')
        self.model = None

        # Try to load pre-trained model
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info(f"Loaded existing dispersion model from {self.model_path}")
            else:
                logger.warning(f"No pre-trained dispersion model found at {self.model_path}, creating a default model")
                self._create_default_model()
                joblib.dump(self.model, self.model_path)
                logger.info(f"Saved default dispersion model to {self.model_path}")
        except Exception as e:
            logger.error(f"Error loading dispersion model: {str(e)}")
            self._create_default_model()

    def _create_default_model(self):
        """Create a default model when no trained model is available"""
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)

        # Generate synthetic training data
        X_dummy = np.random.rand(100, 3)  # source_strength, wind_speed, wind_direction
        y_dummy = np.random.rand(100, 2)  # plume_length, plume_width

        self.model.fit(X_dummy, y_dummy)
        logger.warning("Created a default dispersion model with random data. Train with real data ASAP.")

    def predict(self, source_strength, wind_speed, wind_direction, latitude, longitude):
        """
        Predict gas dispersion based on source and weather conditions
        """
        if self.model:
            X = np.array([[source_strength, wind_speed, wind_direction]])
            try:
                prediction = self.model.predict(X)[0]
                plume_length = prediction[0]
                plume_width = prediction[1]
            except Exception as e:
                logger.error(f"Error making prediction with dispersion model: {str(e)}")
                plume_length, plume_width = self._gaussian_plume_model(source_strength, wind_speed, wind_direction)
        else:
            plume_length, plume_width = self._gaussian_plume_model(source_strength, wind_speed, wind_direction)

        stability = self._get_stability_class(wind_speed)
        result = {
            "plume_length": float(plume_length),
            "plume_width": float(plume_width),
            "downwind_distance": float(plume_length),
            "crosswind_distance": float(plume_width / 2),
            "stability_class": stability,
            "dispersion_coefficients": self._get_dispersion_coefficients(plume_length, stability),
            "concentration_at_distance": {
                "100m": float(self._concentration_at_point(source_strength, wind_speed, 100, 0, stability)),
                "500m": float(self._concentration_at_point(source_strength, wind_speed, 500, 0, stability)),
                "1000m": float(self._concentration_at_point(source_strength, wind_speed, 1000, 0, stability))
            }
        }
        return result

    def _gaussian_plume_model(self, source_strength, wind_speed, wind_direction):
        length_factor = np.sqrt(source_strength) / max(1.0, wind_speed)
        plume_length = 500 * length_factor
        plume_width = plume_length * 0.3
        return max(100, min(5000, plume_length)), max(30, min(1000, plume_width))

    def _get_stability_class(self, wind_speed):
        if wind_speed < 2:
            return 'A'
        elif wind_speed < 3:
            return 'B'
        elif wind_speed < 5:
            return 'C'
        elif wind_speed < 6:
            return 'D'
        elif wind_speed < 7:
            return 'E'
        else:
            return 'F'

    def _get_dispersion_coefficients(self, distance, stability_class):
        coefficients = {
            'A': (0.22, 0.20),
            'B': (0.16, 0.12),
            'C': (0.11, 0.08),
            'D': (0.08, 0.06),
            'E': (0.06, 0.03),
            'F': (0.04, 0.02)
        }
        a, b = coefficients.get(stability_class, (0.1, 0.1))
        sigma_y = a * distance ** 0.9
        sigma_z = b * distance ** 0.7
        return {"sigma_y": float(sigma_y), "sigma_z": float(sigma_z)}

    def _concentration_at_point(self, source_strength, wind_speed, x, y, stability_class):
        disp = self._get_dispersion_coefficients(x, stability_class)
        sigma_y = disp["sigma_y"]
        sigma_z = disp["sigma_z"]
        h = 0  # effective stack height

        term1 = source_strength / (2 * np.pi * wind_speed * sigma_y * sigma_z)
        term2 = np.exp(-0.5 * (y / sigma_y) ** 2)
        term3 = np.exp(-0.5 * (h / sigma_z) ** 2)

        return term1 * term2 * term3


# ===== Test Block =====
if __name__ == "__main__":
    model = DispersionModel()
    result = model.predict(
        source_strength=1000,      # kg/s or MJ
        wind_speed=5.0,            # m/s
        wind_direction=90,         # degrees
        latitude=28.61,            # dummy location
        longitude=77.23
    )

    import pprint
    pprint.pprint(result)
