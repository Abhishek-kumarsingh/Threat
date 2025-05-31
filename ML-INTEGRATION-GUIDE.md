# 🧠 ML Model Integration Guide

## 🎯 Overview

Your threat monitoring system now has **full ML model integration**! The Python-based machine learning models in the `/model/` directory are now properly connected to your React/Node.js application.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   ML Model      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   Port: 27017   │
                    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
npm run dev:with-ml
```
This will start all services in the correct order:
1. Check MongoDB
2. Start ML Model Service (Python)
3. Start Backend API (Node.js)
4. Start Frontend (Next.js)

### Option 2: Manual Startup
```bash
# Terminal 1: Start ML Model
cd model
python app.py

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend
npm run dev
```

### Option 3: Docker (Full Stack)
```bash
npm run docker:ml
```

## 📊 ML Model Features

### 🔬 **Threat Detection Models**
- **ThreatModel**: Analyzes sensor readings to predict threat levels
- **ExplosionModel**: Calculates explosion parameters and energy release
- **DispersionModel**: Predicts gas dispersion patterns based on weather

### 📡 **Supported Sensors**
- **MQ2**: LPG, Propane, Hydrogen detection
- **MQ4**: Methane, CNG detection  
- **MQ6**: LPG, Propane, Isobutane detection
- **MQ8**: Hydrogen detection
- **Temperature**: Environmental temperature
- **Humidity**: Environmental humidity

### 🌍 **Environmental Factors**
- Wind speed and direction
- Geographic coordinates
- Weather conditions

## 🔗 API Endpoints

### ML Model Service (Port 5001)
- `GET /health` - Health check
- `GET /info` - Model information
- `POST /predict` - Main prediction endpoint
- `POST /predict/threat` - Detailed threat analysis
- `POST /evacuation-routes` - Generate evacuation routes
- `POST /sensors/data` - Receive sensor data

### Backend API (Port 5000)
- `GET /api/ml/health` - Check ML model health
- `GET /api/ml/info` - Get model information
- `GET /api/ml/stats` - Model statistics
- `POST /api/ml/test-prediction` - Test prediction
- `POST /api/ml/evacuation-routes` - Get evacuation routes

## 🧪 Testing the Integration

### 1. **Health Check**
Visit: `http://localhost:3000/ml-test`

### 2. **API Testing**
```bash
# Test ML model directly
curl http://localhost:5001/health

# Test through backend
curl http://localhost:5000/api/ml/health
```

### 3. **Prediction Test**
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "mq2_reading": 8,
    "mq4_reading": 6,
    "mq6_reading": 7,
    "mq8_reading": 5,
    "temperature": 30,
    "humidity": 65,
    "location": [40.7128, -74.0060],
    "wind_speed": 12,
    "wind_direction": 180
  }'
```

## 📁 File Structure

```
/model/                     # ML Model Service
├── app.py                 # Main Flask application
├── start-model.py         # Startup script
├── config.py              # Configuration
├── Dockerfile             # Docker configuration
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── models/                # ML model implementations
│   ├── threat_model.py    # Threat detection model
│   ├── explosion_model.py # Explosion modeling
│   └── dispersion_model.py # Gas dispersion model
├── utils/                 # Utility functions
│   ├── geo_utils.py       # Geographic calculations
│   └── visualization.py   # Visualization helpers
└── data/                  # Training and test data

/backend/                   # Backend API
├── controllers/
│   └── mlModelController.js # ML model integration
├── routes/
│   └── mlModel.js         # ML model routes
└── services/
    └── threatPredictionService.js # Updated service

/app/                      # Frontend
└── ml-test/
    └── page.tsx           # ML testing interface
```

## ⚙️ Configuration

### Environment Variables

**ML Model (.env)**
```env
PORT=5001
DEBUG=true
THRESHOLD_MQ2=1000
THRESHOLD_MQ4=1000
THRESHOLD_MQ6=1000
THRESHOLD_MQ8=1000
ZONE_HIGH_THRESHOLD=0.8
ZONE_MEDIUM_THRESHOLD=0.5
ZONE_LOW_THRESHOLD=0.2
```

**Backend (.env)**
```env
PREDICTION_MODEL_URL=http://localhost:5001
```

## 🔧 Troubleshooting

### Common Issues

1. **ML Model Not Starting**
   ```bash
   # Check Python installation
   python --version
   
   # Install dependencies
   cd model
   pip install -r requirements.txt
   ```

2. **Port Conflicts**
   - ML Model: Change PORT in `model/.env`
   - Update PREDICTION_MODEL_URL in `backend/.env`

3. **Connection Errors**
   ```bash
   # Check if ML model is running
   curl http://localhost:5001/health
   
   # Check backend connection
   curl http://localhost:5000/api/ml/health
   ```

4. **Model Files Missing**
   - The system will create default models automatically
   - Check `model/models/saved/` directory

## 📈 Model Performance

### Threat Level Mapping
- **SAFE**: Risk score 0.0 - 0.2
- **LOW**: Risk score 0.2 - 0.5  
- **MODERATE**: Risk score 0.5 - 0.8
- **HIGH**: Risk score 0.8 - 0.9
- **CRITICAL**: Risk score 0.9 - 1.0

### Response Format
```json
{
  "threat_level": "moderate",
  "prediction_value": 6,
  "confidence": 0.85,
  "zones": {
    "extreme_danger": [...],
    "high_danger": [...],
    "moderate_danger": [...],
    "low_danger": [...]
  },
  "evacuation_routes": [...],
  "model_version": "1.0.0",
  "is_fallback": false,
  "recommendations": [...]
}
```

## 🎯 Next Steps

1. **Train Models**: Use your real sensor data to train better models
2. **Add Sensors**: Integrate with actual Arduino sensors
3. **Enhance Visualization**: Add threat zone overlays to maps
4. **Real-time Processing**: Set up continuous monitoring
5. **Alerts Integration**: Connect predictions to alert system

## 🔗 Quick Links

- **ML Test Interface**: http://localhost:3000/ml-test
- **Main Dashboard**: http://localhost:3000/dashboard
- **API Documentation**: http://localhost:5000/api
- **ML Model Health**: http://localhost:5001/health

## 🎉 Success!

Your ML model is now fully integrated! The system can:
- ✅ Predict threat levels from sensor data
- ✅ Generate threat zones and evacuation routes
- ✅ Provide real-time analysis
- ✅ Handle fallback scenarios
- ✅ Scale with Docker

**Ready for production threat monitoring!** 🚀
