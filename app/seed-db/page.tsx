"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const seedDatabase = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to seed database');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Database Seeding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Click the button below to seed the database with demo users.
              </p>
              
              <Button 
                onClick={seedDatabase} 
                disabled={isLoading}
                className="w-full max-w-xs"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Seed Database
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">{result.message}</p>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Demo Credentials:</p>
                      <ul className="space-y-1">
                        <li><strong>Admin:</strong> {result.credentials.admin}</li>
                        <li><strong>Operator:</strong> {result.credentials.operator}</li>
                        <li><strong>User:</strong> {result.credentials.user}</li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="text-center">
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  variant="outline"
                >
                  Go to Login Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
