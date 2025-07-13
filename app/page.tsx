import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CloudLightning,
  ArrowRight,
  Shield,
  Activity,
  Bell,
  MapPin,
  Brain,
  Zap,
  CheckCircle,
  Play,
  Lock,
  BarChart3,
  Eye,
  Award,
  Layers
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
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Demo</a>
              <a href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="font-medium">Log In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium">
                  Get Started
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

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-fade-in">
                  <Activity className="w-3 h-3 mr-1" />
                  Smart Gas Pipeline Monitoring
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up">
                  <span className="block">Intelligent Gas Pipeline</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Sensor Network
                  </span>
                  <span className="block">& Monitoring System</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl leading-relaxed animate-fade-in-up animation-delay-200">
                  Monitor gas pipeline safety with our advanced sensor network. Real-time leak detection, gas concentration monitoring,
                  and AI-powered analytics to ensure pipeline integrity and prevent hazardous incidents.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-400">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 font-semibold px-8 py-4 text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 mt-16 border-t max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">System Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Organizations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">&lt;30s</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-12 opacity-60">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  SOC 2 Compliant
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  ISO 27001 Certified
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  Industry Leader
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="w-full py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-4">
                <Layers className="w-3 h-3 mr-1" />
                Complete Solution
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Advanced Gas Pipeline
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Monitoring Platform
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                Our intelligent sensor network combines cutting-edge gas detection technology with AI analytics
                to provide comprehensive pipeline safety monitoring and leak prevention.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Activity className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Gas Leak Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Monitor gas concentrations 24/7 with MQ2, MQ4, MQ6, and MQ8 sensors for comprehensive pipeline safety monitoring.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Brain className="h-10 w-10 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Predictive Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    AI-powered algorithms predict pipeline failures and gas leaks before they occur, enabling proactive maintenance.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Bell className="h-10 w-10 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Emergency Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Instant notifications for gas leaks and pipeline anomalies with customizable thresholds and emergency protocols.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-xl flex items-center justify-center mb-6">
                    <MapPin className="h-10 w-10 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Interactive Threat Maps</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Visualize threat zones in real-time with interactive maps, evacuation routes, and population impact analysis.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Zap className="h-10 w-10 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Instant Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Automated response protocols with instant notifications and coordinated emergency response procedures.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl flex items-center justify-center mb-6">
                    <BarChart3 className="h-10 w-10 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Comprehensive reporting and analytics with predictive insights and historical trend analysis.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="w-full py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Eye className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Gas Pipeline Monitoring
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard Demo
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                Experience our intelligent gas pipeline monitoring system with real-time sensor data and interactive maps.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Real-time Sensor Dashboard</h3>
                    <p className="text-muted-foreground">Monitor multiple sensors simultaneously with live data visualization and instant status updates.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI Threat Prediction</h3>
                    <p className="text-muted-foreground">Watch our machine learning models predict and identify potential threats before they escalate.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Interactive Threat Maps</h3>
                    <p className="text-muted-foreground">Explore our interactive mapping system with real-time threat zones and evacuation planning.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/auth/register">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Try Interactive Demo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto">
                        <Play className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Interactive Demo</p>
                      <p className="text-sm text-muted-foreground">Click to explore the dashboard</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-purple-500 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
              </div>
            </div>
          </div>
        </section>





        {/* CTA Section */}
        <section className="w-full py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Ready to Monitor Your Gas Pipelines?
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Experience advanced gas pipeline monitoring with our intelligent sensor network.
              Get started today and explore the future of threat detection technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-75">College Project • Educational Purpose • Open Source</p>
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
              Advanced gas pipeline monitoring system with intelligent sensor networks for enhanced safety.
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