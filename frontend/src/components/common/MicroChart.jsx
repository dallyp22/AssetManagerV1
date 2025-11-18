import React from 'react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function MicroChart({ data, type = 'line', color = 'positive', height = 40 }) {
  const colors = {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280'
  };

  const strokeColor = colors[color] || colors.neutral;

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            animationDuration={300}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || strokeColor} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

export default MicroChart;

