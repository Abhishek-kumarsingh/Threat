from models.threat_model import ThreatModel
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_model():
    # Initialize the model
    model = ThreatModel()
    
    # Test cases with different scenarios
    test_cases = [
        {
            "name": "Normal Conditions",
            "mq2": 200,    # Normal LPG level
            "mq4": 150,    # Normal Methane level
            "mq6": 180,    # Normal LPG level
            "mq8": 100,    # Normal Hydrogen level
            "temperature": 25,  # Normal temperature
            "humidity": 45     # Normal humidity
        },
        {
            "name": "High Gas Levels",
            "mq2": 1200,   # High LPG level
            "mq4": 150,    # Normal Methane level
            "mq6": 180,    # Normal LPG level
            "mq8": 100,    # Normal Hydrogen level
            "temperature": 25,  # Normal temperature
            "humidity": 45     # Normal humidity
        },
        {
            "name": "High Temperature",
            "mq2": 200,    # Normal LPG level
            "mq4": 150,    # Normal Methane level
            "mq6": 180,    # Normal LPG level
            "mq8": 100,    # Normal Hydrogen level
            "temperature": 55,  # High temperature
            "humidity": 45     # Normal humidity
        }
    ]
    
    # Run predictions for each test case
    for case in test_cases:
        print(f"\nTesting Scenario: {case['name']}")
        print("-" * 50)
        
        result = model.predict(
            case["mq2"],
            case["mq4"],
            case["mq6"],
            case["mq8"],
            case["temperature"],
            case["humidity"]
        )
        
        # Print results
        print(f"Risk Score: {result['risk_score']:.2f}")
        print(f"Risk Level: {result['risk_level']}")
        print("\nRecommendations:")
        for rec in result['recommendations']:
            print(f"- {rec}")
        
        print("\nSensor Status:")
        for sensor, status in result['sensor_status'].items():
            print(f"- {sensor}: {status}")

if __name__ == "__main__":
    test_model() 