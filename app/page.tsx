import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GaugeCircle, ShieldAlert, BarChart3, CloudLightning } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EcoSentry</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Link href="/#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Real-time Environmental Monitoring System
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Monitor environmental conditions, detect threats, and respond to alerts in real-time with our advanced monitoring system.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                  </Link>
                  <Link href="/#demo">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">View Demo</Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
                    <div className="text-center">
                      <CloudLightning className="h-24 w-24 mx-auto mb-4" />
                      <span className="text-xl font-semibold">Interactive Dashboard Preview</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Our system provides comprehensive monitoring and alert capabilities for environmental safety.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <GaugeCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-time Monitoring</h3>
                <p className="text-muted-foreground text-center">
                  Monitor environmental conditions with live data from multiple sensors.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldAlert className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Threat Detection</h3>
                <p className="text-muted-foreground text-center">
                  Identify potential threats with advanced detection algorithms.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Data Analytics</h3>
                <p className="text-muted-foreground text-center">
                  Generate insights and reports from historical environmental data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join organizations worldwide using our system to protect the environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Link href="/auth/register">
                  <Button size="lg">Sign Up Now</Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">Log In</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/50">
        <div className="container px-4 py-8 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <CloudLightning className="h-5 w-5 text-primary" />
                <span className="text-lg font-bold">EcoSentry</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time environmental monitoring and alert system
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-semibold">Product</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-semibold">Company</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h3 className="text-sm font-semibold">Legal</h3>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Security</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">© 2025 EcoSentry. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">GitHub</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}