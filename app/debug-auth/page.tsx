"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export default function DebugAuthPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Check current auth state
    const checkAuthState = () => {
      if (typeof window !== 'undefined') {
        const authToken = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = localStorage.getItem('user');
        
        setAuthState({
          hasAuthToken: !!authToken,
          hasRefreshToken: !!refreshToken,
          hasUser: !!user,
          authToken: authToken ? authToken.substring(0, 20) + '...' : null,
          user: user ? JSON.parse(user) : null
        });
      }
    };

    checkAuthState();
    
    // Update every second to see real-time changes
    const interval = setInterval(checkAuthState, 1000);
    return () => clearInterval(interval);
  }, []);

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
      setTestResult({
        success: response.ok,
        status: response.status,
        data: data
      });

      if (response.ok) {
        // Manually store tokens to test
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setTestResult(null);
  };

  const testCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      setTestResult({
        success: response.ok,
        status: response.status,
        data: data,
        endpoint: '/api/auth/me'
      });

    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/auth/me'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testLogin} className="w-full">
                Test Login API
              </Button>
              <Button onClick={testCurrentUser} variant="outline" className="w-full">
                Test /auth/me
              </Button>
              <Button onClick={clearAuth} variant="destructive" className="w-full">
                Clear Auth State
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Auth State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Auth State
            </CardTitle>
          </CardHeader>
          <CardContent>
            {authState && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Has Auth Token:</strong> {authState.hasAuthToken ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Has Refresh Token:</strong> {authState.hasRefreshToken ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Has User Data:</strong> {authState.hasUser ? '✅' : '❌'}
                  </div>
                </div>
                
                {authState.authToken && (
                  <div>
                    <strong>Token Preview:</strong> {authState.authToken}
                  </div>
                )}
                
                {authState.user && (
                  <div>
                    <strong>User:</strong> {authState.user.email} ({authState.user.role})
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Test Results {testResult.endpoint && `(${testResult.endpoint})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription>
                  <pre className="text-xs overflow-auto max-h-64">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/auth/login'}
            variant="outline"
          >
            Go to Login Page
          </Button>
        </div>
      </div>
    </div>
  );
}
