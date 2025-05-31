#!/usr/bin/env python3
"""
Simple test to start the ML model service
"""

import sys
import os

# Add model directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'model'))

try:
    print("Starting ML model test...")
    
    from flask import Flask, jsonify
    from flask_cors import CORS
    
    print("Flask imports successful")
    
    app = Flask(__name__)
    CORS(app)
    
    print("Flask app created")
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "ok"}), 200
    
    @app.route('/test', methods=['GET'])
    def test():
        return jsonify({"message": "ML model test successful"}), 200
    
    print("Routes defined")
    
    if __name__ == '__main__':
        print("Starting Flask app on port 5001...")
        app.run(debug=True, host='0.0.0.0', port=5001)
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
