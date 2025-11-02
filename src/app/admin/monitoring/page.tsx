'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { monitoring } from '@/services/monitoring';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UsageMetrics {
  totalTokens: number;
  totalCost: number;
  averageTokensPerRequest: number;
  requestsPerMinute: number;
  errorRate: number;
  averageLatency: number;
}

interface UsageTrend {
  date: string;
  tokens: number;
  cost: number;
}

interface OptimizationSuggestion {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [remainingCredit, setRemainingCredit] = useState(0);
  const [usageTrend, setUsageTrend] = useState<UsageTrend[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);

  useEffect(() => {
    const fetchData = () => {
      const metrics = monitoring.getMetrics();
      setMetrics(metrics);
      setTotalCost(monitoring.getTotalCost());
      setRemainingCredit(monitoring.getRemainingCredit());
      
      // Calculate usage trend
      const dailyUsage = metrics.reduce((acc, metric) => {
        const date = new Date(metric.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + metric.cost;
        return acc;
      }, {} as Record<string, number>);

      setUsageTrend(Object.entries(dailyUsage).map(([date, cost]) => ({
        date,
        tokens: 0, // Assuming tokens are not available in the metric
        cost
      })));

      // Generate optimization suggestions
      const suggestions = [];
      const modelUsage = metrics.reduce((acc, metric) => {
        acc[metric.model] = (acc[metric.model] || 0) + metric.cost;
        return acc;
      }, {} as Record<string, number>);

      if (modelUsage['gpt-4'] > modelUsage['gpt-3.5-turbo']) {
        suggestions.push({
          title: 'Consider using GPT-3.5 for simpler tasks to reduce costs',
          description: '',
          impact: 'medium' as const
        });
      }

      if (metrics.some(m => m.inputTokens > 2000)) {
        suggestions.push({
          title: 'Optimize prompts to reduce token usage',
          description: '',
          impact: 'medium' as const
        });
      }

      setOptimizationSuggestions(suggestions);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: usageTrend.map((data) => data.date),
    datasets: [
      {
        label: "Tokens Used",
        data: usageTrend.map((data) => data.tokens),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
      {
        label: "Cost ($)",
        data: usageTrend.map((data) => data.cost),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Daily Usage Trend",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen text-white p-8" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Fire Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 -z-10"
      >
        <source src="/fire_background.mp4" type="video/mp4" />
      </video>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="inline-flex items-center space-x-4 mb-8"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center animate-emberFloat">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl font-black elegant-fire fire-gradient animate-flameFlicker">REVOLUTIONARY API USAGE DASHBOARD</h1>
        </motion.div>
        
        {/* Revolutionary Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rebellious-card p-8">
            <h2 className="text-2xl font-black mb-4 text-[#e2c376] elegant-fire">TOTAL COST</h2>
            <p className="text-4xl font-black text-[#e2c376]">${totalCost.toFixed(2)}</p>
          </div>
          <div className="rebellious-card p-8">
            <h2 className="text-2xl font-black mb-4 text-[#e2c376] elegant-fire">REMAINING CREDIT</h2>
            <p className="text-4xl font-black text-[#e2c376]">${remainingCredit.toFixed(2)}</p>
          </div>
          <div className="rebellious-card p-8">
            <h2 className="text-2xl font-black mb-4 text-[#e2c376] elegant-fire">TOTAL REQUESTS</h2>
            <p className="text-4xl font-black text-[#e2c376]">{metrics.length}</p>
          </div>
        </div>

        {/* Revolutionary Usage Trend Chart */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trends" className="text-lg font-black">REVOLUTIONARY TRENDS</TabsTrigger>
            <TabsTrigger value="suggestions" className="text-lg font-black">OPTIMIZATION SUGGESTIONS</TabsTrigger>
          </TabsList>
          <TabsContent value="trends">
            <div className="rebellious-card p-8">
              <h2 className="text-2xl font-black mb-6 text-[#e2c376] elegant-fire">REVOLUTIONARY USAGE TRENDS</h2>
              <div className="h-[400px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="suggestions">
            <div className="rebellious-card p-8">
              <h2 className="text-2xl font-black mb-6 text-[#e2c376] elegant-fire">REVOLUTIONARY OPTIMIZATION SUGGESTIONS</h2>
              <div className="space-y-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-[#e2c376] mr-4 text-2xl">•</span>
                    <span className="text-white/90 text-lg elegant-fire">{suggestion.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Revolutionary Detailed Metrics */}
        <div className="rebellious-card p-8">
          <h2 className="text-2xl font-black mb-6 text-[#e2c376] elegant-fire">REVOLUTIONARY RECENT REQUESTS</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left border-b border-[#e2c376]/30">
                  <th className="pb-4 text-lg font-black text-[#e2c376] elegant-fire">TIMESTAMP</th>
                  <th className="pb-4 text-lg font-black text-[#e2c376] elegant-fire">MODEL</th>
                  <th className="pb-4 text-lg font-black text-[#e2c376] elegant-fire">INPUT TOKENS</th>
                  <th className="pb-4 text-lg font-black text-[#e2c376] elegant-fire">OUTPUT TOKENS</th>
                  <th className="pb-4 text-lg font-black text-[#e2c376] elegant-fire">COST</th>
                  <th className="pb-4 text-lg font-black text-[#e2c376] elegant-fire">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice().reverse().map((metric, index) => (
                  <tr key={index} className="border-b border-[#e2c376]/20">
                    <td className="py-4 text-white/90 elegant-fire">{new Date(metric.timestamp).toLocaleString()}</td>
                    <td className="py-4 text-white/90 elegant-fire">{metric.model}</td>
                    <td className="py-4 text-white/90 elegant-fire">{metric.inputTokens}</td>
                    <td className="py-4 text-white/90 elegant-fire">{metric.outputTokens}</td>
                    <td className="py-4 text-white/90 elegant-fire">${metric.cost.toFixed(4)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-2 rounded-xl font-black ${
                        metric.success ? 'bg-[#e2c376] text-black' : 'bg-[#D62828] text-white'
                      }`}>
                        {metric.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 