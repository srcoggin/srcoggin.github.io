'use client'

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerMetrics } from '@/types'

interface PlayerChartProps {
  data: PlayerMetrics[]
}

export default function PlayerChart({ data }: PlayerChartProps) {
  const { theme } = useTheme()

  const chartData = data.map(d => ({
    week: d.week,
    points: d.points,
    opponent: d.opponent,
  }))

  const colors = {
    text: theme === 'dark' ? '#f0f6fc' : '#1f2328',
    textSecondary: theme === 'dark' ? '#8b949e' : '#57606a',
    grid: theme === 'dark' ? '#30363d' : '#d0d7de',
    bg: theme === 'dark' ? '#21262d' : '#ffffff',
    border: theme === 'dark' ? '#30363d' : '#d0d7de',
    dot: theme === 'dark' ? '#58a6ff' : '#0969da',
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
          <XAxis 
            dataKey="week" 
            name="Week" 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={{ stroke: colors.grid }}
            label={{ 
              value: 'Week', 
              position: 'insideBottom', 
              offset: -10, 
              fill: colors.textSecondary,
              fontSize: 12,
            }}
          />
          <YAxis 
            dataKey="points" 
            name="Fantasy Points" 
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={{ stroke: colors.grid }}
            label={{ 
              value: 'Fantasy Points', 
              angle: -90, 
              position: 'insideLeft', 
              fill: colors.textSecondary,
              fontSize: 12,
              offset: 10,
            }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: colors.grid }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload
                return (
                  <div 
                    className="p-3 rounded-lg shadow-lg border"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  >
                    <p className="font-semibold">Week {d.week}</p>
                    <p style={{ color: colors.textSecondary }}>vs {d.opponent}</p>
                    <p className="font-bold text-lg" style={{ color: colors.dot }}>
                      {d.points.toFixed(1)} pts
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Scatter 
            data={chartData} 
            fill={colors.dot}
            strokeWidth={2}
            stroke={colors.dot}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
