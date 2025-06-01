'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  Zap, 
  Database, 
  Brain, 
  AlertTriangle, 
  Monitor,
  Download,
  Maximize2,
  Info
} from 'lucide-react';

const SystemArchitecturePage = () => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const mermaidDiagram = `
graph TB
    %% Hardware Layer
    subgraph "Hardware Layer"
        A[Arduino/ESP32<br/>Microcontroller]
        B[MQ2 Sensor<br/>LPG, Propane, Hydrogen]
        C[MQ4 Sensor<br/>Methane, CNG]
        D[MQ6 Sensor<br/>LPG, Propane, Isobutane]
        E[MQ8 Sensor<br/>Hydrogen]
        F[DHT11/22<br/>Temperature & Humidity]
        G[Wind Sensor<br/>Speed & Direction]
        H[GPS Module<br/>Location Data]
    end

    %% Data Collection
    subgraph "Data Collection & Transmission"
        I[Sensor Data Aggregation<br/>Arduino Code]
        J[WiFi/Ethernet Module<br/>ESP32/Arduino Ethernet]
        K[Serial Communication<br/>USB/Bluetooth]
        L[Data Packet Formation<br/>JSON Format]
    end

    %% Backend Processing
    subgraph "Backend Data Processing"
        M[Sensor Controller<br/>sensorController.js]
        N[Data Validation<br/>& Sanitization]
        O[MongoDB Storage<br/>SensorReading Collection]
        P[Real-time Broadcasting<br/>WebSocket]
        Q[Threshold Checking<br/>Status Determination]
    end

    %% ML Processing
    subgraph "ML Model Service (Python)"
        R[ThreatModel<br/>threat_model.py]
        S[ExplosionModel<br/>explosion_model.py]
        T[DispersionModel<br/>dispersion_model.py]
        U[Prediction API<br/>Flask Server :5001]
        V[Feature Engineering<br/>Data Preprocessing]
    end

    %% Decision Engine
    subgraph "Threat Analysis Engine"
        W[Threat Prediction Service<br/>threatPredictionService.js]
        X[Risk Assessment<br/>Confidence Scoring]
        Y[Threat Zone Calculation<br/>Geographic Mapping]
        Z[Alert Generation<br/>Severity Classification]
    end

    %% Response System
    subgraph "Response & Visualization"
        AA[Dashboard Updates<br/>Real-time Display]
        BB[Alert Notifications<br/>Email/SMS/Push]
        CC[Evacuation Routes<br/>Path Calculation]
        DD[Emergency Response<br/>Automated Actions]
        EE[Historical Analysis<br/>Trend Monitoring]
    end

    %% Data Flow Connections
    B --> I
    C --> I
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    A --> I
    
    I --> J
    I --> K
    J --> L
    K --> L
    
    L --> M
    M --> N
    N --> O
    M --> P
    N --> Q
    
    Q --> W
    O --> V
    V --> R
    V --> S
    V --> T
    R --> U
    S --> U
    T --> U
    
    U --> W
    W --> X
    X --> Y
    Y --> Z
    
    Z --> AA
    Z --> BB
    Y --> CC
    Z --> DD
    O --> EE
    
    P --> AA

    %% Styling
    classDef hardware fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef collection fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef backend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef ml fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef analysis fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef response fill:#e0f2f1,stroke:#00695c,stroke-width:2px

    class A,B,C,D,E,F,G,H hardware
    class I,J,K,L collection
    class M,N,O,P,Q backend
    class R,S,T,U,V ml
    class W,X,Y,Z analysis
    class AA,BB,CC,DD,EE response
  `;

  const systemLayers = [
    {
      id: 'hardware',
      name: 'Hardware Layer',
      icon: <Cpu className="w-5 h-5" />,
      color: 'bg-red-50 border-red-200',
      description: 'Physical sensors and microcontrollers',
      components: [
        'Arduino/ESP32 Microcontroller',
        'MQ2 Sensor (LPG, Propane, Hydrogen)',
        'MQ4 Sensor (Methane, CNG)',
        'MQ6 Sensor (LPG, Propane, Isobutane)',
        'MQ8 Sensor (Hydrogen)',
        'DHT11/22 (Temperature & Humidity)',
        'Wind Sensor (Speed & Direction)',
        'GPS Module (Location Data)'
      ]
    },
    {
      id: 'collection',
      name: 'Data Collection',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-green-50 border-green-200',
      description: 'Data aggregation and transmission',
      components: [
        'Sensor Data Aggregation',
        'WiFi/Ethernet Module',
        'Serial Communication',
        'JSON Data Packet Formation'
      ]
    },
    {
      id: 'backend',
      name: 'Backend Processing',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-blue-50 border-blue-200',
      description: 'Data validation, storage, and real-time broadcasting',
      components: [
        'Sensor Controller',
        'Data Validation & Sanitization',
        'MongoDB Storage',
        'Real-time WebSocket Broadcasting',
        'Threshold Checking'
      ]
    },
    {
      id: 'ml',
      name: 'ML Model Service',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-purple-50 border-purple-200',
      description: 'Machine learning prediction models',
      components: [
        'ThreatModel (threat_model.py)',
        'ExplosionModel (explosion_model.py)',
        'DispersionModel (dispersion_model.py)',
        'Flask Prediction API (:5001)',
        'Feature Engineering'
      ]
    },
    {
      id: 'analysis',
      name: 'Threat Analysis',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-orange-50 border-orange-200',
      description: 'Risk assessment and threat zone calculation',
      components: [
        'Threat Prediction Service',
        'Risk Assessment & Confidence Scoring',
        'Threat Zone Geographic Mapping',
        'Alert Generation & Classification'
      ]
    },
    {
      id: 'response',
      name: 'Response System',
      icon: <Monitor className="w-5 h-5" />,
      color: 'bg-teal-50 border-teal-200',
      description: 'Visualization and emergency response',
      components: [
        'Real-time Dashboard Updates',
        'Alert Notifications (Email/SMS/Push)',
        'Evacuation Route Calculation',
        'Automated Emergency Response',
        'Historical Analysis & Trends'
      ]
    }
  ];

  const downloadDiagram = () => {
    const element = document.createElement('a');
    const file = new Blob([mermaidDiagram], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'threat-monitoring-architecture.mmd';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Architecture</h1>
          <p className="text-muted-foreground">
            Complete Hardware-to-ML-to-Frontend Flow Visualization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadDiagram}>
            <Download className="w-4 h-4 mr-2" />
            Download Diagram
          </Button>
          <Button variant="outline">
            <Maximize2 className="w-4 h-4 mr-2" />
            Full Screen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diagram" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diagram">Architecture Diagram</TabsTrigger>
          <TabsTrigger value="layers">System Layers</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="space-y-4">
          {/* Mermaid Diagram Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Complete System Architecture Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-center text-muted-foreground mb-4">
                  <Info className="w-4 h-4 inline mr-2" />
                  Interactive diagram showing complete data flow from hardware to frontend
                </div>
                
                {/* Architecture visualization */}
                <div className="bg-gray-50 p-6 rounded-lg overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {systemLayers.map((layer, index) => (
                      <div key={layer.id} className={`p-4 rounded-lg border-2 ${layer.color}`}>
                        <div className="flex items-center mb-2">
                          {layer.icon}
                          <h3 className="ml-2 font-semibold">{layer.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{layer.description}</p>
                        <div className="space-y-1">
                          {layer.components.slice(0, 3).map((component, idx) => (
                            <div key={idx} className="text-xs bg-white px-2 py-1 rounded">
                              {component}
                            </div>
                          ))}
                          {layer.components.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{layer.components.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold mb-3">Data Flow Visualization</h4>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                      <Badge className="bg-red-100 text-red-800">Hardware Sensors</Badge>
                      <span>→</span>
                      <Badge className="bg-green-100 text-green-800">Data Collection</Badge>
                      <span>→</span>
                      <Badge className="bg-blue-100 text-blue-800">Backend Processing</Badge>
                      <span>→</span>
                      <Badge className="bg-purple-100 text-purple-800">ML Models</Badge>
                      <span>→</span>
                      <Badge className="bg-orange-100 text-orange-800">Threat Analysis</Badge>
                      <span>→</span>
                      <Badge className="bg-teal-100 text-teal-800">Dashboard & Alerts</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Note:</strong> This diagram shows the complete flow from physical sensors through ML processing to dashboard visualization.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="space-y-4">
          {/* System Layers */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemLayers.map((layer) => (
              <Card 
                key={layer.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLayer === layer.id ? 'ring-2 ring-blue-500' : ''
                } ${layer.color}`}
                onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    {layer.icon}
                    <span className="ml-2">{layer.name}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{layer.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {layer.components.map((component, index) => (
                      <div key={index} className="flex items-center">
                        <Badge variant="outline" className="text-xs">
                          {component}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-4">
          {/* Data Flow Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Hardware Reading",
                    description: "Sensors collect gas concentrations, temperature, humidity, and environmental data",
                    time: "Every 1-5 seconds"
                  },
                  {
                    step: 2,
                    title: "Data Transmission",
                    description: "Arduino aggregates sensor data and transmits via WiFi/Ethernet to backend",
                    time: "Real-time"
                  },
                  {
                    step: 3,
                    title: "Backend Processing",
                    description: "Data validation, MongoDB storage, threshold checking, and WebSocket broadcasting",
                    time: "< 100ms"
                  },
                  {
                    step: 4,
                    title: "ML Prediction",
                    description: "If thresholds exceeded, ML models analyze threat level and calculate risk scores",
                    time: "< 500ms"
                  },
                  {
                    step: 5,
                    title: "Threat Analysis",
                    description: "Risk assessment, geographic mapping, and alert generation based on ML results",
                    time: "< 200ms"
                  },
                  {
                    step: 6,
                    title: "Response & Visualization",
                    description: "Dashboard updates, notifications, evacuation routes, and emergency response",
                    time: "Immediate"
                  }
                ].map((flow) => (
                  <div key={flow.step} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {flow.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{flow.title}</h4>
                      <p className="text-sm text-muted-foreground">{flow.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {flow.time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemArchitecturePage;
