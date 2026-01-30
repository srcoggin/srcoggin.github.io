'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface Column<T> {
  key: keyof T | string
  header: string
  format?: (value: any, row: T) => string | number
  cellClass?: (value: any, row: T) => string
  headerClass?: string
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  maxHeight?: string
  className?: string
  showGradient?: 'green' | 'red'
  gradientColumn?: string
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  maxHeight,
  className = '',
  showGradient,
  gradientColumn,
}: DataTableProps<T>) {
  const { theme } = useTheme()

  // Calculate min/max for gradient
  let minVal = 0
  let maxVal = 1
  if (showGradient && gradientColumn) {
    const values = data.map(row => row[gradientColumn] as number).filter(v => !isNaN(v))
    if (values.length > 0) {
      minVal = Math.min(...values)
      maxVal = Math.max(...values)
    }
  }

  const getGradientOpacity = (value: number): number => {
    if (maxVal === minVal) return 0.3
    return 0.1 + ((value - minVal) / (maxVal - minVal)) * 0.4
  }

  const getValue = (row: T, key: string): any => {
    const keys = key.split('.')
    let value: any = row
    for (const k of keys) {
      value = value?.[k]
    }
    return value
  }

  const borderColor = theme === 'dark' ? '#30363d' : '#d0d7de'
  const headerBg = theme === 'dark' ? '#21262d' : '#f6f8fa'
  const hoverBg = theme === 'dark' ? '#30363d' : '#eaeef2'
  const textSecondary = theme === 'dark' ? '#8b949e' : '#57606a'

  return (
    <div 
      className={`overflow-x-auto rounded-lg border ${className}`}
      style={{ 
        maxHeight: maxHeight || undefined, 
        overflowY: maxHeight ? 'auto' : undefined,
        borderColor,
      }}
    >
      <table className="min-w-full">
        <thead style={{ backgroundColor: headerBg }}>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`
                  px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider
                  sticky top-0
                  ${col.headerClass || ''}
                  ${col.width || ''}
                `}
                style={{ 
                  backgroundColor: headerBg,
                  color: textSecondary,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const gradientValue = gradientColumn ? row[gradientColumn] as number : 0
            const gradientStyle = showGradient && gradientColumn
              ? {
                  backgroundColor: showGradient === 'green'
                    ? `rgba(63, 185, 80, ${getGradientOpacity(gradientValue)})`
                    : `rgba(248, 81, 73, ${getGradientOpacity(gradientValue)})`,
                }
              : undefined

            return (
              <tr
                key={rowIndex}
                className="transition-colors duration-150"
                style={{
                  ...gradientStyle,
                  borderBottom: `1px solid ${borderColor}`,
                }}
                onMouseEnter={(e) => {
                  if (!gradientStyle) {
                    e.currentTarget.style.backgroundColor = hoverBg
                  }
                }}
                onMouseLeave={(e) => {
                  if (!gradientStyle) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {columns.map(col => {
                  const rawValue = getValue(row, String(col.key))
                  const displayValue = col.format ? col.format(rawValue, row) : rawValue
                  const cellClass = col.cellClass ? col.cellClass(rawValue, row) : ''

                  // Handle highlight classes
                  let cellStyle: React.CSSProperties = {}
                  if (cellClass.includes('bg-green-200')) {
                    cellStyle.backgroundColor = 'rgba(63, 185, 80, 0.3)'
                  } else if (cellClass.includes('bg-red-200')) {
                    cellStyle.backgroundColor = 'rgba(248, 81, 73, 0.3)'
                  }

                  return (
                    <td
                      key={String(col.key)}
                      className={`px-3 py-2 text-sm ${col.width || ''}`}
                      style={cellStyle}
                    >
                      {displayValue ?? '-'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
