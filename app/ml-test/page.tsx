'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Activity, Brain, Zap } from 'lucide-react';

interface MLModelHealth {
  status: string;
  lastCheck: string;
  modelReady: boolean;
}

interface MLModelInfo {
  version: string;
  status: string;
  capabilities: string[];
  sensors_supported: string[];
  last_updated: string;
}

interface PredictionResult {
  threat_level: string;
  prediction_value: number;
  confidence: number;
  zones: any;
  evacuation_routes: any[];
  model_version: string;
  is_fallback: boolean;
  sensor_status: any;
  recommendations: string[];
}

export default function MLTestPage() {
  const [health, setHealth] = useState<MLModelHealth | null>(null);
  const [modelInfo, setModelInfo] = useState<MLModelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test data form
  const [testData, setTestData] = useState({
    mq2_reading: 5,
    mq4_reading: 3,
    mq6_reading: 4,
    mq8_reading: 2,
    temperature: 25,
    humidity: 60,
    location: [40.7128, -74.0060],
    wind_speed: 10,
    wind_direction: 180
  });

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ml/health', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check health');
      }
      
      const result = await response.json();
      setHealth(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getModelInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ml/info', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get model info');
      }
      
      const result = await response.json();
      setModelInfo(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPrediction = async () => {
    setTestLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ml/test-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to test prediction');
      }
      
      const result = await response.json();
      setPrediction(result.data.prediction);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    getModelInfo();
  }, []);

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ML Model Integration Test</h1>
        <Button onClick={() => { checkHealth(); getModelInfo(); }} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Model Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                    {health.status === 'healthy' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {health.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Model Ready:</span>
                  <Badge variant={health.modelReady ? 'default' : 'secondary'}>
                    {health.modelReady ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Check:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(health.lastCheck).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Model Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modelInfo ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Version:</span>
                  <Badge variant="outline">{modelInfo.version}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={modelInfo.status === 'ready' ? 'default' : 'secondary'}>
                    {modelInfo.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Capabilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modelInfo.capabilities.map((cap, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Supported Sensors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {modelInfo.sensors_supported.map((sensor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sensor.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Test Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <h3 className="font-semibold">Sensor Readings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="mq2">MQ2 (ppm)</Label>
                  <Input
                    id="mq2"
                    type="number"
                    value={testData.mq2_reading}
                    onChange={(e) => setTestData({...testData, mq2_reading: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="mq4">MQ4 (ppm)</Label>
                  <Input
                    id="mq4"
                    type="number"
                    value={testData.mq4_reading}
                    onChange={(e) => setTestData({...testData, mq4_reading: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="mq6">MQ6 (ppm)</Label>
                  <Input
                    id="mq6"
                    type="number"
                    value={testData.mq6_reading}
                    onChange={(e) => setTestData({...testData, mq6_reading: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="mq8">MQ8 (ppm)</Label>
                  <Input
                    id="mq8"
                    type="number"
                    value={testData.mq8_reading}
                    onChange={(e) => setTestData({...testData, mq8_reading: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={testData.temperature}
                    onChange={(e) => setTestData({...testData, temperature: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={testData.humidity}
                    onChange={(e) => setTestData({...testData, humidity: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <h3 className="font-semibold">Environmental Data</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="wind_speed">Wind Speed (m/s)</Label>
                  <Input
                    id="wind_speed"
                    type="number"
                    value={testData.wind_speed}
                    onChange={(e) => setTestData({...testData, wind_speed: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="wind_direction">Wind Direction (°)</Label>
                  <Input
                    id="wind_direction"
                    type="number"
                    value={testData.wind_direction}
                    onChange={(e) => setTestData({...testData, wind_direction: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <Button onClick={testPrediction} disabled={testLoading} className="w-full">
                {testLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Run Prediction Test
              </Button>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="font-semibold">Prediction Results</h3>
              {prediction ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Threat Level:</span>
                    <Badge className={getThreatLevelColor(prediction.threat_level)}>
                      {prediction.threat_level.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Risk Score:</span>
                    <span className="font-mono">{prediction.prediction_value}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Confidence:</span>
                    <span className="font-mono">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Model Version:</span>
                    <Badge variant="outline">{prediction.model_version}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fallback Mode:</span>
                    <Badge variant={prediction.is_fallback ? 'destructive' : 'default'}>
                      {prediction.is_fallback ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  {prediction.recommendations && prediction.recommendations.length > 0 && (
                    <div>
                      <span className="font-medium">Recommendations:</span>
                      <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Run a prediction test to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
