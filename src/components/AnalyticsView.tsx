'use client';

import React from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { BarChart3, PieChart, Users, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsView: React.FC = () => {
  const { leads } = useCRM();

  // Status Breakdown
  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    pending: leads.filter(l => l.status === 'pending').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  const statusData = {
    labels: ['New', 'Pending', 'Contacted', 'Closed'],
    datasets: [
      {
        data: [statusCounts.new, statusCounts.pending, statusCounts.contacted, statusCounts.closed],
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)', // Emerald
          'rgba(245, 158, 11, 0.75)', // Amber
          'rgba(139, 92, 246, 0.75)', // Purple
          'rgba(100, 116, 139, 0.75)', // Slate
        ],
        borderColor: [
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#64748b',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  // Priority Breakdown
  const priorityCounts = {
    high: leads.filter(l => l.priority === 'high').length,
    medium: leads.filter(l => l.priority === 'medium').length,
    low: leads.filter(l => l.priority === 'low').length,
  };

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.75)', // Red
          'rgba(59, 130, 246, 0.75)', // Blue
          'rgba(148, 163, 184, 0.75)', // Slate/Gray
        ],
        borderColor: [
          '#ef4444',
          '#3b82f6',
          '#94a3b8',
        ],
        borderWidth: 1.5,
      },
    ],
  };

  // City-wise Distribution
  const citiesMap: { [key: string]: number } = {};
  leads.forEach((l) => {
    const city = l.city || 'Unknown';
    citiesMap[city] = (citiesMap[city] || 0) + 1;
  });

  const sortedCities = Object.entries(citiesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5 cities

  const cityData = {
    labels: sortedCities.map(c => c[0]),
    datasets: [
      {
        label: 'Leads per City',
        data: sortedCities.map(c => c[1]),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Primary blue
        borderColor: '#3b82f6',
        borderRadius: 8,
        borderWidth: 1,
      },
    ],
  };

  // Monthly Growth (Simulated / Calculated based on createdAt dates)
  // Let's build a timeline of last 6 months
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyCounts = Array(6).fill(0);
  const monthlyLabels: string[] = [];
  
  // Initialize months labels
  const currentMonth = new Date().getMonth();
  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonth - i + 12) % 12;
    monthlyLabels.push(monthNames[idx]);
  }

  // Count leads created per month
  leads.forEach((l) => {
    const date = new Date(l.createdAt);
    const month = date.getMonth();
    const diffMonths = (new Date().getFullYear() - date.getFullYear()) * 12 + (new Date().getMonth() - month);
    if (diffMonths >= 0 && diffMonths < 6) {
      monthlyCounts[5 - diffMonths] += 1;
    }
  });

  const growthData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'New Lead Signups',
        data: monthlyCounts,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        borderWidth: 2.5,
      },
    ],
  };

  // Options configurations
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11, weight: 'bold' as const },
          color: 'rgba(100, 116, 139, 0.9)',
        },
      },
    },
  };

  const scaleOptions = {
    ...commonOptions,
    scales: {
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.15)' },
        ticks: { stepSize: 1, font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Sales Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor your customer growth curves, status ratios, and regional density metrics.
        </p>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Distribution Doughnut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Lead Status Ratio</h3>
          </div>
          <div className="flex-1 relative h-60">
            <Doughnut data={statusData} options={commonOptions} />
          </div>
        </div>

        {/* Priority Breakdown Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Priority Distribution</h3>
          </div>
          <div className="flex-1 relative h-60">
            <Pie data={priorityData} options={commonOptions} />
          </div>
        </div>

        {/* Monthly Lead Growth Line */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Monthly Lead Growth</h3>
          </div>
          <div className="flex-1 relative h-60">
            <Line data={growthData} options={scaleOptions} />
          </div>
        </div>

        {/* City distribution Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-950 dark:text-white">Lead density by City</h3>
          </div>
          <div className="flex-1 relative h-60">
            <Bar data={cityData} options={scaleOptions} />
          </div>
        </div>

      </div>
    </div>
  );
};
