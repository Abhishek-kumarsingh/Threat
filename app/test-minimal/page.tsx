"use client";

import { ThemeProvider } from '@/components/providers/theme-provider';

export default function TestMinimalPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Test Page</h1>
      <p>This page tests the basic setup without all context providers.</p>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold">Test Results:</h2>
        <p>✅ Page loads successfully</p>
        <p>✅ Basic React components work</p>
        <p>✅ Tailwind CSS is working</p>
      </div>
    </div>
  );
}
