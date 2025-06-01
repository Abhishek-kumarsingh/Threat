# Screenshot Generation Guide

This guide helps you create professional screenshots for the README documentation.

## 🎯 Required Screenshots

### 1. Dashboard Overview (`dashboard-overview.png`)
**Path**: `/dashboard`
**Login as**: Admin (admin@example.com / admin123)

**What to capture**:
- Full dashboard with sidebar open
- System health metrics cards
- Active alerts summary
- Sensor status overview
- Navigation elements
- Real-time statistics

**Steps**:
1. Login as admin
2. Navigate to main dashboard
3. Ensure sidebar is open
4. Wait for all data to load
5. Take full-screen screenshot
6. Crop to show main content area

### 2. Interactive Threat Map (`threat-map.png`)
**Path**: `/dashboard/threat-zones`
**Login as**: Admin or Operator

**What to capture**:
- Interactive map with threat zones
- Sensor locations marked
- Evacuation routes visible
- Map controls and legend
- Zoom controls
- Layer toggles

**Steps**:
1. Navigate to threat zones page
2. Enable all map layers
3. Zoom to show threat zones clearly
4. Enable evacuation routes
5. Ensure legend is visible
6. Take screenshot of map area

### 3. Sensor Monitoring (`sensor-monitoring.png`)
**Path**: `/dashboard/sensors`
**Login as**: Admin or Operator

**What to capture**:
- Sensor list with status indicators
- Real-time readings
- Filter and search options
- Sensor details panel (if open)
- Status badges and icons

**Steps**:
1. Navigate to sensors page
2. Ensure sensors are loaded
3. Show mix of online/offline sensors
4. Include search/filter bar
5. Take screenshot of full interface

### 4. Alert Management (`alert-management.png`)
**Path**: `/dashboard/alerts`
**Login as**: Admin or Operator

**What to capture**:
- Active alerts list
- Different severity levels
- Alert actions (acknowledge, resolve)
- Filter options
- Alert details

**Steps**:
1. Navigate to alerts page
2. Ensure alerts with different severities are visible
3. Show action buttons
4. Include filter/sort options
5. Take screenshot of alert interface

## 🛠️ Screenshot Tools

### Recommended Tools:
- **Windows**: Snipping Tool, Greenshot, ShareX
- **Mac**: Built-in Screenshot (Cmd+Shift+4), CleanShot X
- **Linux**: GNOME Screenshot, Flameshot, Spectacle
- **Cross-platform**: LightShot, Nimbus Screenshot

### Browser Setup:
1. Use Chrome or Firefox for consistency
2. Set browser window to 1920x1080
3. Zoom level: 100%
4. Clear browser cache
5. Disable browser extensions that might interfere

## 📐 Image Specifications

- **Format**: PNG
- **Resolution**: 1920x1080 minimum
- **Quality**: High quality, web-optimized
- **Size**: Keep under 5MB per image
- **Naming**: Use exact filenames as specified

## 🎨 Post-Processing Tips

1. **Crop appropriately**: Remove unnecessary browser chrome
2. **Add annotations**: Highlight important features
3. **Optimize file size**: Use tools like TinyPNG
4. **Check readability**: Ensure text is clear and readable
5. **Consistent styling**: Use same browser and zoom level

## 📁 File Organization

Save screenshots to:
```
docs/images/
├── dashboard-overview.png
├── threat-map.png
├── sensor-monitoring.png
├── alert-management.png
├── user-roles.png
└── system-architecture.png
```

## 🔄 Creating GIFs

For animated demonstrations:

### Tools:
- **LICEcap** (Windows/Mac)
- **GIPHY Capture** (Mac)
- **ScreenToGif** (Windows)
- **Peek** (Linux)

### GIF Scenarios:
1. **Login Flow** (login-flow.gif)
   - Show login process
   - Role selection
   - Dashboard loading

2. **Alert Workflow** (alert-workflow.gif)
   - Create new alert
   - Acknowledge alert
   - Resolve alert

3. **Threat Zone Demo** (threat-zone-demo.gif)
   - Map interaction
   - Zoom and pan
   - Layer toggles

4. **Real-time Updates** (real-time-updates.gif)
   - Show live sensor data updates
   - Alert notifications
   - Dashboard refreshing

### GIF Specifications:
- **Duration**: 5-15 seconds
- **Frame rate**: 10-15 FPS
- **Size**: Keep under 10MB
- **Resolution**: 1280x720 or 1920x1080

## ✅ Quality Checklist

Before finalizing screenshots:

- [ ] All UI elements are visible and clear
- [ ] No sensitive data is shown
- [ ] Consistent browser and styling
- [ ] Proper image optimization
- [ ] Correct file naming
- [ ] Appropriate image dimensions
- [ ] Good contrast and readability
- [ ] Professional appearance

## 🚀 Automation (Optional)

For consistent screenshots, consider using:
- **Puppeteer** for automated browser screenshots
- **Playwright** for cross-browser testing
- **Cypress** for E2E testing with screenshots

Example Puppeteer script:
```javascript
const puppeteer = require('puppeteer');

async function takeScreenshot() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000/dashboard');
  await page.screenshot({ path: 'docs/images/dashboard-overview.png' });
  await browser.close();
}
```
