# Threat Monitoring System Frontend

A comprehensive React-based threat monitoring system with real-time sensor data, alert management, and predictive threat zone analysis.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Operator, User)
- Secure login/logout with session management
- Password reset functionality

### 📊 Dashboard
- **Admin Dashboard**: System overview, user management, system health
- **Operator Dashboard**: Alert management, sensor monitoring, operations control
- **User Dashboard**: Personal alerts, assigned sensors, threat zone notifications

### 🔍 Sensor Management
- Real-time sensor data monitoring
- Sensor status tracking (active, inactive, error)
- Historical data visualization
- Threshold configuration and alerts
- Battery level monitoring
- Location-based sensor mapping

### 🚨 Alert System
- Real-time alert notifications
- Severity-based alert classification (Low, Medium, High, Critical)
- Alert acknowledgment and resolution workflow
- Alert history and analytics
- Custom alert creation
- Email and push notifications

### 🗺️ Threat Zone Management
- Interactive threat zone visualization
- Predictive threat zone modeling
- Evacuation route planning
- Population impact assessment
- Real-time threat level monitoring
- Historical threat zone analysis

### 🔔 Notification System
- Real-time WebSocket notifications
- Browser push notifications
- Email notifications
- Notification preferences management
- Notification history

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time communication

### State Management
- **React Context** - Global state management
- **Custom Hooks** - Reusable logic
- **Local Storage** - Client-side persistence

### API Integration
- **Axios** - HTTP client with interceptors
- **JWT** - Token-based authentication
- **WebSocket** - Real-time updates

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── dashboard/                # Dashboard pages
│   │   ├── sensors/
│   │   ├── alerts/
│   │   ├── threat-zones/
│   │   └── users/
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── src/
│   ├── components/              # React components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── sensors/             # Sensor components
│   │   ├── alerts/              # Alert components
│   │   ├── threatZones/         # Threat zone components
│   │   └── ui/                  # Reusable UI components
│   ├── contexts/                # React contexts
│   │   ├── SensorContext.tsx
│   │   ├── ThreatZoneContext.tsx
│   │   └── ...
│   ├── services/                # API services
│   │   ├── api.js               # Axios configuration
│   │   ├── authService.js
│   │   ├── sensorService.js
│   │   ├── alertService.js
│   │   ├── threatZoneService.js
│   │   ├── notificationService.js
│   │   └── socketService.js
│   └── hooks/                   # Custom hooks
├── contexts/                    # Legacy contexts (to be migrated)
├── components/                  # Legacy components (to be migrated)
└── public/                      # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server (see API documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd threat-monitoring-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

For testing purposes, use these demo credentials:

- **Admin**: admin@example.com / admin123
- **Operator**: operator@example.com / operator123  
- **User**: user@example.com / user123

## API Integration

The frontend integrates with a RESTful API and WebSocket server. See `api-design.md` for complete API documentation.

### Key API Endpoints

- **Authentication**: `/api/auth/*`
- **Sensors**: `/api/sensors/*`
- **Alerts**: `/api/alerts/*`
- **Threat Zones**: `/api/threat-zones/*`
- **Users**: `/api/users/*`
- **Notifications**: `/api/notifications/*`

### WebSocket Events

- `sensor_reading` - Real-time sensor data
- `alert_created` - New alert notifications
- `alert_updated` - Alert status changes
- `threat_zone_created` - New threat zones
- `threat_zone_updated` - Threat zone updates
- `system_notification` - System messages

## Development

### Code Organization

- **Services**: API integration and business logic
- **Contexts**: Global state management
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks
- **Types**: TypeScript type definitions

### Best Practices

- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Use loading states for better UX
- Implement proper accessibility
- Follow responsive design principles

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`
