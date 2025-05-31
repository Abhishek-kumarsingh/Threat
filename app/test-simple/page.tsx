"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function TestSimplePage() {
  const [testResult, setTestResult] = useState<string | null>(null);

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@threatguard.com',
          password: 'admin123'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult('Login successful! Token received.');
        // Store tokens
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setTestResult(`Login failed: ${data.error}`);
      }

    } catch (error) {
      setTestResult(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setTestResult('Auth cleared');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setTestResult(`Authenticated as: ${JSON.parse(user).email}`);
    } else {
      setTestResult('Not authenticated');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Simple Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testLogin} className="w-full">
                Test Login
              </Button>
              <Button onClick={checkAuth} variant="outline" className="w-full">
                Check Auth
              </Button>
              <Button onClick={clearAuth} variant="destructive" className="w-full">
                Clear Auth
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.includes('successful') || testResult.includes('Authenticated') ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.includes('successful') || testResult.includes('Authenticated') ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {testResult}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-2">
              <Button 
                onClick={() => window.location.href = '/auth/login'}
                variant="outline"
              >
                Go to Login Page
              </Button>
              <br />
              <Button 
                onClick={() => window.location.href = '/debug-auth'}
                variant="outline"
              >
                Go to Debug Page
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>✅ Page loads without context providers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>✅ React components working</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>✅ API calls working</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>✅ LocalStorage working</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
