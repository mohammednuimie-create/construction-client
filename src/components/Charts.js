import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

const COLORS = ['#1e3a5f', '#2a9d8f', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// Pie Chart Component
export function ProjectsPieChart({ data }) {
  const chartData = [
    { name: 'قيد الانتظار', value: data.pending || 0, color: '#3b82f6' },
    { name: 'قيد التنفيذ', value: data.inProgress || 0, color: '#f59e0b' },
    { name: 'مكتملة', value: data.completed || 0, color: '#10b981' },
    { name: 'ملغية', value: data.cancelled || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Bar Chart Component for Payments
export function PaymentsBarChart({ data }) {
  // Group payments by month
  const monthlyData = data.reduce((acc, payment) => {
    const date = new Date(payment.paymentDate || payment.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, amount: 0, count: 0 };
    }
    acc[monthKey].amount += payment.amount || 0;
    acc[monthKey].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: BRAND.muted, fontSize: 12 }}
          style={{ direction: 'ltr' }}
        />
        <YAxis 
          tick={{ fill: BRAND.muted, fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value) => [`$${value.toLocaleString()}`, 'المبلغ']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            direction: 'rtl'
          }}
        />
        <Legend />
        <Bar dataKey="amount" fill={BRAND.accent} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Line Chart Component for Budget vs Cost
export function BudgetLineChart({ projects }) {
  const chartData = projects
    .filter(p => p.budget && p.totalCost)
    .map(p => ({
      name: p.name?.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      budget: p.budget || 0,
      cost: p.totalCost || 0,
      profit: (p.budget || 0) - (p.totalCost || 0),
    }))
    .slice(0, 10); // Top 10 projects

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: BRAND.muted, fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fill: BRAND.muted, fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value) => [`$${value.toLocaleString()}`, '']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            direction: 'rtl'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="budget" 
          stackId="1"
          stroke={BRAND.primary} 
          fill={BRAND.primary}
          fillOpacity={0.6}
        />
        <Area 
          type="monotone" 
          dataKey="cost" 
          stackId="2"
          stroke={BRAND.accent} 
          fill={BRAND.accent}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Progress Chart Component
export function ProgressChart({ projects }) {
  const chartData = projects
    .filter(p => p.progress !== undefined)
    .map(p => ({
      name: p.name?.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      progress: p.progress || 0,
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 8); // Top 8 projects

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          type="number"
          domain={[0, 100]}
          tick={{ fill: BRAND.muted, fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          dataKey="name" 
          type="category"
          tick={{ fill: BRAND.muted, fontSize: 11 }}
          width={100}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'التقدم']}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            direction: 'rtl'
          }}
        />
        <Bar 
          dataKey="progress" 
          fill={BRAND.accent}
          radius={[0, 8, 8, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={
                entry.progress >= 75 ? '#10b981' :
                entry.progress >= 50 ? '#3b82f6' :
                entry.progress >= 25 ? '#f59e0b' : '#ef4444'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default { ProjectsPieChart, PaymentsBarChart, BudgetLineChart, ProgressChart };



