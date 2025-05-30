"use client";

import { useSensors } from "@/contexts/sensor-context";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

type AnalyticsChartProps = {
  timeRange: "24h" | "7d" | "30d";
  detailed?: boolean;
};

export default function AnalyticsChart({ 
  timeRange, 
  detailed = false 
}: AnalyticsChartProps) {
  const { sensors } = useSensors();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Ensure this component only renders on the client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate chart data based on sensor history and time range
  useEffect(() => {
    if (!sensors.length) return;

    // Determine number of data points based on time range
    let dataPoints = 24; // 24 hours
    let interval = 1; // 1 hour
    
    if (timeRange === "7d") {
      dataPoints = 7 * 24;
      interval = 6; // Every 6 hours
    } else if (timeRange === "30d") {
      dataPoints = 30;
      interval = 24; // Daily
    }
    
    // Prepare data structure for chart
    const now = new Date();
    const data = [];
    
    for (let i = dataPoints; i >= 0; i -= interval) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const entry: any = {
        time: timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      
      if (timeRange !== "24h") {
        entry.date = timestamp.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        });
      }
      
      // Add sensor values
      sensors.forEach(sensor => {
        // Find the closest historical value to this timestamp
        const historyPoint = sensor.history.find(h => 
          Math.abs(new Date(h.timestamp).getTime() - timestamp.getTime()) < 1800000
        );
        
        entry[sensor.name] = historyPoint ? historyPoint.value : null;
      });
      
      data.push(entry);
    }
    
    setChartData(data);
  }, [sensors, timeRange]);

  if (!mounted) return null;

  const isDark = theme === "dark";
  
  // Determine the x-axis data key based on time range
  const xAxisDataKey = timeRange === "24h" ? "time" : "date";
  
  // Dynamic colors for chart lines - we use CSS variables to match the theme
  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="w-full h-full min-h-[300px]">
      {sensors.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No sensor data available</p>
        </div>
      ) : detailed ? (
        <ResponsiveContainer width="100%" height={500}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {sensors.map((sensor, i) => (
                <linearGradient key={sensor.id} id={`color${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
            <XAxis 
              dataKey={xAxisDataKey} 
              tick={{ fill: isDark ? "#aaa" : "#666" }}
              tickLine={{ stroke: isDark ? "#666" : "#ccc" }}
            />
            <YAxis 
              tick={{ fill: isDark ? "#aaa" : "#666" }}
              tickLine={{ stroke: isDark ? "#666" : "#ccc" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? "hsl(var(--card))" : "white",
                borderColor: isDark ? "hsl(var(--border))" : "#eee",
                color: isDark ? "white" : "black"
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            {sensors.map((sensor, i) => (
              <Area
                key={sensor.id}
                type="monotone"
                dataKey={sensor.name}
                stroke={chartColors[i % chartColors.length]}
                fill={`url(#color${sensor.id})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
            <XAxis 
              dataKey={xAxisDataKey} 
              tick={{ fill: isDark ? "#aaa" : "#666" }}
              tickLine={{ stroke: isDark ? "#666" : "#ccc" }}
            />
            <YAxis 
              tick={{ fill: isDark ? "#aaa" : "#666" }}
              tickLine={{ stroke: isDark ? "#666" : "#ccc" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? "hsl(var(--card))" : "white",
                borderColor: isDark ? "hsl(var(--border))" : "#eee",
                color: isDark ? "white" : "black"
              }}
            />
            <Legend />
            {sensors.map((sensor, i) => (
              <Line
                key={sensor.id}
                type="monotone"
                dataKey={sensor.name}
                stroke={chartColors[i % chartColors.length]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}