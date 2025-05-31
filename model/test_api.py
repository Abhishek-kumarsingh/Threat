import requests
import json

def test_threat_prediction():
    # Test data matching the API's expected format
    data = {
        "mq2_reading": 200,      # Normal LPG level
        "mq4_reading": 150,      # Normal Methane level
        "mq6_reading": 180,      # Normal LPG level
        "mq8_reading": 100,      # Normal Hydrogen level
        "temperature": 25,       # Normal temperature
        "humidity": 45,          # Normal humidity
        "location": [28.61, 77.23],  # Example coordinates
        "wind_speed": 5.0,       # m/s
        "wind_direction": 90     # degrees from north
    }
    
    # Make request to the API
    try:
        response = requests.post(
            'http://127.0.0.1:5000/predict',
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        
        # Print the response
        print("\nAPI Response:")
        print("-" * 50)
        print(f"Status Code: {response.status_code}")
        print("\nResponse Data:")
        print(json.dumps(response.json(), indent=2))
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the Flask application is running.")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_threat_prediction() 