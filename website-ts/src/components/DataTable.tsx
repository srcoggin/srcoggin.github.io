'use client'

import React from 'react'

interface Column<T> {
  key: keyof T | string
  header: string
  format?: (value: any, row: T) => string | number
  cellClass?: (value: any, row: T) => string
  headerClass?: string
  width?: string
}

/** Per-column gradient: highIsGood = green for high values, lowIsGood = green for low values */
export type ColumnGradientDirection = 'highIsGood' | 'lowIsGood'

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  maxHeight?: string
  className?: string
  showGradient?: 'green' | 'red'
  gradientColumn?: string
  /** Per-column number coloring: key = column key, value = gradient direction */
  columnGradients?: Record<string, ColumnGradientDirection>
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  maxHeight,
  className = '',
  showGradient,
  gradientColumn,
  columnGradients,
}: DataTableProps<T>) {
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

  function getValueRaw(row: T, key: string): any {
    const keys = key.split('.')
    let value: any = row
    for (const k of keys) value = value?.[k]
    return value
  }

  const columnMinMax = React.useMemo(() => {
    if (!columnGradients || Object.keys(columnGradients).length === 0) return {}
    const result: Record<string, { min: number; max: number }> = {}
    for (const colKey of Object.keys(columnGradients)) {
      const values = data
        .map(row => getValueRaw(row, colKey))
        .filter((v): v is number => typeof v === 'number' && !isNaN(v))
      if (values.length > 0) {
        result[colKey] = { min: Math.min(...values), max: Math.max(...values) }
      }
    }
    return result
  }, [data, columnGradients])

  function getColumnGradientStyle(colKey: string, rawValue: any): React.CSSProperties | undefined {
    const dir = columnGradients?.[colKey]
    const range = columnMinMax[colKey]
    if (!dir || !range || typeof rawValue !== 'number' || isNaN(rawValue)) return undefined
    const { min, max } = range
    const t = max === min ? 0.5 : (rawValue - min) / (max - min)
    const goodT = dir === 'highIsGood' ? t : 1 - t
    const greenOpacity = 0.08 + goodT * 0.35
    const redOpacity = 0.08 + (1 - goodT) * 0.35
    return {
      backgroundColor: `rgba(63, 185, 80, ${greenOpacity})`,
      boxShadow: `inset 0 0 0 1px rgba(248, 81, 73, ${redOpacity * 0.5})`,
    }
  }

  const getValue = (row: T, key: string): any => getValueRaw(row, key)

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-[var(--border-color)] ${className}`}
      style={{
        maxHeight: maxHeight || undefined,
        overflowY: maxHeight ? 'auto' : undefined,
      }}
    >
      <table className="min-w-full">
        <thead className="bg-[var(--bg-card)]">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`
                  px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider
                  sticky top-0 text-[var(--text-secondary)]
                  border-b border-[var(--border-color)]
                  ${col.headerClass || ''}
                  ${col.width || ''}
                `}
                style={{ backgroundColor: 'var(--bg-card)' }}
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
                className="transition-colors duration-150 hover:bg-[var(--bg-hover)]"
                style={{
                  ...gradientStyle,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                {columns.map(col => {
                  const colKey = String(col.key)
                  const rawValue = getValue(row, colKey)
                  const displayValue = col.format ? col.format(rawValue, row) : rawValue
                  const cellClass = col.cellClass ? col.cellClass(rawValue, row) : ''
                  const isTextOnlyClass = cellClass && !cellClass.includes('bg-')

                  let cellStyle: React.CSSProperties = {}
                  if (!isTextOnlyClass && cellClass.includes('bg-green-200')) {
                    cellStyle.backgroundColor = 'rgba(63, 185, 80, 0.3)'
                  } else if (!isTextOnlyClass && cellClass.includes('bg-red-200')) {
                    cellStyle.backgroundColor = 'rgba(248, 81, 73, 0.3)'
                  } else if (!isTextOnlyClass) {
                    const colGrad = getColumnGradientStyle(colKey, rawValue)
                    if (colGrad) cellStyle = { ...cellStyle, ...colGrad }
                  }

                  const cellContent = displayValue ?? '-'
                  const inner = isTextOnlyClass && cellClass ? (
                    <span className={cellClass}>{cellContent}</span>
                  ) : (
                    cellContent
                  )

                  return (
                    <td
                      key={colKey}
                      className={`px-3 py-2 text-sm ${col.width || ''}`}
                      style={cellStyle}
                    >
                      {inner}
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
