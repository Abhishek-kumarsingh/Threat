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
  Users,
  CheckCircle,
  Star,
  Play,
  Lock,
  BarChart3,
  Eye,
  Award,
  Target,
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
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Reviews</a>
            </nav>
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
                  AI-Powered Real-time Monitoring
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up">
                  <span className="block">Next-Generation</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Threat Detection
                  </span>
                  <span className="block">& Response System</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl leading-relaxed animate-fade-in-up animation-delay-200">
                  Protect your environment with our cutting-edge AI-powered monitoring system. Real-time threat detection,
                  intelligent predictive analytics, and comprehensive response coordination to keep you one step ahead of potential risks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-400">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Start Free Trial
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
                Comprehensive Threat
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Monitoring Platform
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                Our advanced monitoring system combines cutting-edge AI technology with intelligent analytics
                to provide unparalleled protection for your environment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Activity className="h-10 w-10 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Monitor environmental conditions 24/7 with live data streams from multiple IoT sensors and advanced analytics.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Brain className="h-10 w-10 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">AI-Powered Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Advanced machine learning algorithms identify potential threats and anomalies before they become critical.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl flex items-center justify-center mb-6">
                    <Bell className="h-10 w-10 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">Smart Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Receive intelligent notifications via multiple channels with customizable thresholds and escalation rules.
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
                See ThreatGuard Pro
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  In Action
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                Experience the power of our AI-driven threat detection system with real-time monitoring capabilities.
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

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Target className="w-3 h-3 mr-1" />
                Flexible Pricing
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Choose Your
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Protection Level
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                Scalable solutions for organizations of all sizes, from small facilities to enterprise-level operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <Card className="relative border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription className="text-base">Perfect for small facilities</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Up to 10 sensors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Real-time monitoring</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Basic alerts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Email support</span>
                  </div>
                  <div className="pt-6">
                    <Button className="w-full" variant="outline">
                      Start Free Trial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="relative border-2 border-blue-500 hover:shadow-lg transition-all duration-300 scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription className="text-base">Ideal for growing organizations</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$299</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Up to 100 sensors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>AI threat detection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Interactive maps</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>24/7 phone support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="pt-6">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Start Free Trial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription className="text-base">For large-scale operations</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Unlimited sensors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Custom ML models</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>White-label solution</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>On-premise deployment</span>
                  </div>
                  <div className="pt-6">
                    <Button className="w-full" variant="outline">
                      Contact Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Users className="w-3 h-3 mr-1" />
                Customer Success
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                Trusted by Industry
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Leaders Worldwide
                </span>
              </h2>
              <p className="max-w-3xl mx-auto text-xl text-muted-foreground leading-relaxed">
                See how organizations are transforming their threat detection capabilities with ThreatGuard Pro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;ThreatGuard Pro has revolutionized our emergency response capabilities. The AI-powered predictions have helped us prevent three major incidents this year alone.&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      SM
                    </div>
                    <div>
                      <p className="font-semibold">Sarah Mitchell</p>
                      <p className="text-sm text-muted-foreground">Safety Director, Global Manufacturing Corp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;The real-time monitoring and instant alerts have significantly improved our response times. Our team feels more confident knowing we have this level of protection.&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      JC
                    </div>
                    <div>
                      <p className="font-semibold">James Chen</p>
                      <p className="text-sm text-muted-foreground">Operations Manager, TechHub Industries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    &ldquo;Implementation was seamless, and the support team is exceptional. The interactive threat maps have become an essential tool for our emergency planning.&rdquo;
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      MR
                    </div>
                    <div>
                      <p className="font-semibold">Maria Rodriguez</p>
                      <p className="text-sm text-muted-foreground">Emergency Coordinator, City Municipal Services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Company logos */}
            <div className="mt-16 pt-16 border-t">
              <p className="text-center text-muted-foreground mb-8">Trusted by leading organizations worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
                <div className="text-2xl font-bold text-gray-400">GlobalTech</div>
                <div className="text-2xl font-bold text-gray-400">SafetyFirst</div>
                <div className="text-2xl font-bold text-gray-400">IndustrialCorp</div>
                <div className="text-2xl font-bold text-gray-400">CityServices</div>
                <div className="text-2xl font-bold text-gray-400">SecureOps</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Ready to Protect Your Environment?
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of organizations worldwide who trust ThreatGuard Pro for their critical monitoring needs.
              Start your free trial today and experience the future of threat detection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-75">No credit card required • 30-day free trial • Cancel anytime</p>
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