"use client";

import React from 'react';

/**
 * Simple bar chart component that displays data with rectangular bars
 */
export function BarChart({ 
  data = [], 
  categories = [],
  index = "name",
  valueFormatter = (value: number) => `${value}`,
  height = 300,
  yAxisWidth = 40
}: {
  data: any[];
  categories: string[];
  index: string;
  valueFormatter?: (value: number) => string;
  height?: number;
  yAxisWidth?: number;
}) {
  if (data.length === 0) {
    return <div>No data available</div>;
  }

  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => 
    Math.max(...categories.map(cat => item[cat] || 0))
  ));

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex h-full">
        {/* Y-axis labels */}
        <div style={{ width: `${yAxisWidth}px` }} className="flex flex-col justify-between py-2 text-xs text-muted-foreground">
          <div>{valueFormatter(maxValue)}</div>
          <div>{valueFormatter(maxValue * 0.75)}</div>
          <div>{valueFormatter(maxValue * 0.5)}</div>
          <div>{valueFormatter(maxValue * 0.25)}</div>
          <div>{valueFormatter(0)}</div>
        </div>

        {/* Chart area */}
        <div className="flex-1 flex items-end gap-2">
          {data.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary/80 rounded-t" 
                style={{ 
                  height: `${(item[categories[0]] / maxValue) * 100}%`,
                  minHeight: item[categories[0]] > 0 ? '4px' : '0'
                }}
                title={`${item[index]}: ${valueFormatter(item[categories[0]])}`}
              />
              <div className="text-xs mt-2 truncate w-full text-center" title={item[index]}>
                {item[index]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple line chart component for displaying trends over time
 */
export function LineChart({
  data = [],
  categories = [],
  index = "name",
  valueFormatter = (value: number) => `${value}`,
  height = 300,
  yAxisWidth = 40
}: {
  data: any[];
  categories: string[];
  index: string;
  valueFormatter?: (value: number) => string;
  height?: number;
  yAxisWidth?: number;
}) {
  if (data.length === 0) {
    return <div>No data available</div>;
  }

  // Find the maximum value for scaling
  const maxValue = Math.max(...data.map(item => 
    Math.max(...categories.map(cat => item[cat] || 0))
  ));

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex h-full">
        {/* Y-axis labels */}
        <div style={{ width: `${yAxisWidth}px` }} className="flex flex-col justify-between py-2 text-xs text-muted-foreground">
          <div>{valueFormatter(maxValue)}</div>
          <div>{valueFormatter(maxValue * 0.75)}</div>
          <div>{valueFormatter(maxValue * 0.5)}</div>
          <div>{valueFormatter(maxValue * 0.25)}</div>
          <div>{valueFormatter(0)}</div>
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 grid grid-rows-4 w-full h-full">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="border-t border-gray-200 w-full h-full" />
            ))}
          </div>

          {/* Data points */}
          <div className="absolute inset-0 flex items-end">
            <svg className="w-full h-full" viewBox={`0 0 ${data.length * 50} 100`} preserveAspectRatio="none">
              <polyline
                points={data
                  .map((item, i) => `${i * 50 + 25},${100 - (item[categories[0]] / maxValue) * 100}`)
                  .join(' ')}
                className="stroke-primary stroke-2 fill-none"
              />
              {data.map((item, i) => (
                <circle
                  key={i}
                  cx={i * 50 + 25}
                  cy={100 - (item[categories[0]] / maxValue) * 100}
                  r="3"
                  className="fill-primary"
                  data-tip={`${item[index]}: ${valueFormatter(item[categories[0]])}`}
                />
              ))}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-4 text-xs text-muted-foreground">
            {data.map((item, i) => (
              <div key={i} className="truncate" title={item[index]}>
                {item[index]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 