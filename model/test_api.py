import requests
import json

def test_scenarios():
    # Define different test scenarios
    scenarios = [
        {
            "name": "Normal Conditions",
            "data": {
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
        },
        {
            "name": "High Gas Levels",
            "data": {
                "mq2_reading": 1200,     # High LPG level
                "mq4_reading": 150,      # Normal Methane level
                "mq6_reading": 180,      # Normal LPG level
                "mq8_reading": 100,      # Normal Hydrogen level
                "temperature": 25,       # Normal temperature
                "humidity": 45,          # Normal humidity
                "location": [28.61, 77.23],
                "wind_speed": 5.0,
                "wind_direction": 90
            }
        },
        {
            "name": "High Temperature",
            "data": {
                "mq2_reading": 200,      # Normal LPG level
                "mq4_reading": 150,      # Normal Methane level
                "mq6_reading": 180,      # Normal LPG level
                "mq8_reading": 100,      # Normal Hydrogen level
                "temperature": 55,       # High temperature
                "humidity": 45,          # Normal humidity
                "location": [28.61, 77.23],
                "wind_speed": 5.0,
                "wind_direction": 90
            }
        }
    ]
    
    # Test each scenario
    for scenario in scenarios:
        print(f"\nTesting Scenario: {scenario['name']}")
        print("-" * 50)
        
        try:
            # Make request to the API
            response = requests.post(
                'http://127.0.0.1:5000/predict',
                json=scenario['data'],
                headers={'Content-Type': 'application/json'}
            )
            
            # Print the response
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                print("\nResponse Data:")
                print(json.dumps(response.json(), indent=2))
            else:
                print(f"Error: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("Error: Could not connect to the server. Make sure the Flask application is running.")
        except Exception as e:
            print(f"Error: {str(e)}")
        
        print("\n" + "="*50)

if __name__ == "__main__":
    test_scenarios() 