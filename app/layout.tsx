import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { AlertProvider } from '@/contexts/alert-context';
import { SensorProvider } from '../src/contexts/SensorContext';
import { ThreatZoneProvider } from '../src/contexts/ThreatZoneContext';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { NotificationProvider } from '@/contexts/notification-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Threat Monitoring System',
  description: 'Advanced threat monitoring and alert system with real-time sensor data and predictive analytics',
  keywords: 'threat monitoring, sensors, alerts, security, real-time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SensorProvider>
              <ThreatZoneProvider>
                <WebSocketProvider>
                  <NotificationProvider>
                    <AlertProvider>
                      {children}
                      <Toaster />
                    </AlertProvider>
                  </NotificationProvider>
                </WebSocketProvider>
              </ThreatZoneProvider>
            </SensorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}