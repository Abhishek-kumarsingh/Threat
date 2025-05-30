# Development Guide

This guide provides detailed information for developers working on the Threat Monitoring System Frontend.

## Quick Start

1. **Setup the project**
   ```bash
   npm run setup
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Architecture

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Context** for state management
- **Axios** for API calls
- **Socket.io** for real-time updates

### Folder Structure
```
├── app/                     # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── src/
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── sensors/        # Sensor-related components
│   │   ├── alerts/         # Alert-related components
│   │   └── threatZones/    # Threat zone components
│   ├── contexts/           # React contexts for state management
│   ├── services/           # API service layer
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── components/             # Legacy UI components (to be migrated)
├── contexts/               # Legacy contexts (to be migrated)
└── public/                 # Static assets
```

## State Management

### Context Architecture
The application uses React Context for global state management:

- **AuthContext**: User authentication and authorization
- **AlertContext**: Alert management and real-time updates
- **SensorContext**: Sensor data and monitoring
- **ThreatZoneContext**: Threat zone management
- **NotificationContext**: User notifications

### Service Layer
API interactions are handled through service classes:

- **authService**: Authentication operations
- **sensorService**: Sensor CRUD and data fetching
- **alertService**: Alert management
- **threatZoneService**: Threat zone operations
- **notificationService**: Notification handling
- **socketService**: WebSocket communication

## Component Guidelines

### Component Structure
```typescript
// ComponentName.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ComponentProps } from "./types";

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  prop1, 
  prop2 
}) => {
  // State and hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### Naming Conventions
- **Components**: PascalCase (e.g., `SensorList`, `AlertDetail`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase with descriptive names

### Component Best Practices
1. Use TypeScript interfaces for props
2. Implement proper error handling
3. Add loading states for async operations
4. Use semantic HTML elements
5. Implement proper accessibility
6. Follow responsive design principles

## API Integration

### Service Pattern
```typescript
// Example service method
async createSensor(sensorData: CreateSensorRequest): Promise<Sensor> {
  try {
    const response = await api.post('/sensors', sensorData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create sensor');
  }
}
```

### Error Handling
- Use try-catch blocks in service methods
- Throw descriptive error messages
- Handle errors in components with user-friendly messages
- Log errors for debugging

### Real-time Updates
WebSocket integration for real-time features:

```typescript
// Subscribe to real-time updates
useEffect(() => {
  const handleSensorReading = (data: SensorReading) => {
    // Update sensor data
  };

  socketService.subscribe('sensor_reading', handleSensorReading);

  return () => {
    socketService.unsubscribe('sensor_reading', handleSensorReading);
  };
}, []);
```

## Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use CSS variables for theme colors
- Follow mobile-first responsive design

### Component Styling
```typescript
// Good: Semantic class names with Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <Badge variant="destructive">Critical</Badge>
</div>
```

### Theme Support
- Use CSS variables for colors
- Support light/dark themes
- Use `next-themes` for theme switching

## Testing

### Testing Strategy
1. **Unit Tests**: Individual components and utilities
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Complete user workflows

### Testing Tools
- **Jest**: Test runner and assertions
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Cypress**: E2E testing

### Test Structure
```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

## Performance Optimization

### Code Splitting
- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load non-critical components

### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### Bundle Optimization
- Analyze bundle size with `npm run analyze`
- Remove unused dependencies
- Use tree shaking for libraries
- Optimize images and assets

## Security Considerations

### Authentication
- Store JWT tokens securely
- Implement token refresh logic
- Handle authentication errors gracefully
- Use HTTPS in production

### Data Validation
- Validate all user inputs
- Sanitize data before display
- Use TypeScript for type safety
- Implement proper error boundaries

### API Security
- Include authentication headers
- Validate API responses
- Handle rate limiting
- Implement CSRF protection

## Deployment

### Build Process
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket server URL
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

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

## Debugging

### Development Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab for API debugging
- Console for logging

### Common Issues
1. **CORS errors**: Check API server configuration
2. **WebSocket connection issues**: Verify socket server
3. **Authentication problems**: Check token storage and refresh
4. **Build errors**: Verify TypeScript types and imports

### Logging
```typescript
// Use structured logging
console.log('User action:', {
  action: 'sensor_created',
  userId: user.id,
  sensorId: sensor.id,
  timestamp: new Date().toISOString()
});
```

## Contributing

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request
5. Code review and merge

### Commit Messages
```
feat: add sensor threshold configuration
fix: resolve WebSocket connection issues
docs: update API documentation
style: improve responsive design for mobile
refactor: extract common utility functions
test: add unit tests for alert service
```

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile
- [ ] Accessibility requirements met
- [ ] Performance impact considered

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)

### Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Best Practices
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://typescript-eslint.io/rules)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
