import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CloudLightning,
  ArrowRight,
  Shield,
  Activity,
  Bell
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <CloudLightning className="h-8 w-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ThreatGuard Pro
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="font-medium">Log In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Activity className="w-3 h-3 mr-1" />
                  Real-time Monitoring
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  <span className="block">Advanced</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Threat Detection
                  </span>
                  <span className="block">& Monitoring</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl leading-relaxed">
                  Protect your environment with our cutting-edge monitoring system. Real-time threat detection,
                  intelligent alerts, and comprehensive analytics to keep you one step ahead of potential risks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 font-semibold px-8 py-3 text-lg">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1000+</div>
                  <div className="text-sm text-muted-foreground">Organizations</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Features Section */}
        <section className="w-full py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Comprehensive Threat
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Monitoring Solution
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Our advanced monitoring system combines cutting-edge technology with intelligent analytics
                to provide unparalleled protection for your environment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Monitor environmental conditions 24/7 with live data streams from multiple sensors.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>AI-Powered Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Advanced algorithms identify potential threats and anomalies before they become critical.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle>Smart Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Receive intelligent notifications via multiple channels with customizable thresholds.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CloudLightning className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ThreatGuard Pro
              </span>
            </div>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Advanced threat detection and environmental monitoring system trusted by organizations worldwide.
            </p>
            <div className="border-t pt-8">
              <p className="text-muted-foreground text-sm">
                © 2025 ThreatGuard Pro. All rights reserved. Made with ❤️ for a safer world.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}