import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatDollar(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

export default function WalkawayChart({ data, onHoverAge, onClickAge, onUnlock, lockedAge }) {
  const handleMouseMove = (state) => {
    if (state?.activeLabel != null) {
      onHoverAge(state.activeLabel);
    }
  };

  const handleClick = (state) => {
    if (state?.activeLabel != null) {
      onClickAge(state.activeLabel);
    } else {
      onUnlock();
    }
  };

  return (
    <div className="chart-section">
      <h2>Growth & Net Walkaway Value</h2>
      <div className="legend">
        <div className="legend-item">
          <span className="swatch" style={{ background: '#8b5cf6' }} />
          Roth Net Walkaway
        </div>
        <div className="legend-item">
          <span className="swatch" style={{ background: '#f472b6' }} />
          Brokerage Net Walkaway
        </div>
        <div className="legend-item">
          <span className="swatch" style={{ background: 'rgba(139,92,246,0.4)' }} />
          Roth Contributions
        </div>
        <div className="legend-item">
          <span className="swatch" style={{ background: '#6b7280' }} />
          Gross Balance (Roth)
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} onMouseMove={handleMouseMove} onMouseLeave={() => onHoverAge(null)} onClick={handleClick}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="age"
            stroke="#8b949e"
            tick={{ fill: '#8b949e', fontSize: 12 }}
          />
          <YAxis
            stroke="#8b949e"
            tick={{ fill: '#8b949e', fontSize: 12 }}
            tickFormatter={formatDollar}
            width={70}
          />
          <Tooltip content={() => null} />
          <ReferenceLine
            x={59.5}
            stroke="#58a6ff"
            strokeDasharray="6 4"
            label={{ value: '59\u00BD', fill: '#58a6ff', fontSize: 12, position: 'top' }}
          />
          {lockedAge != null && (
            <ReferenceLine
              x={lockedAge}
              stroke="#e6edf3"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              label={{ value: `\u{1F4CC} ${lockedAge}`, fill: '#e6edf3', fontSize: 11, position: 'top' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="rothGross"
            stroke="#6b7280"
            strokeWidth={1.5}
            strokeOpacity={0.5}
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="rothContributions"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeOpacity={0.4}
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="rothWalkaway"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#8b5cf6' }}
            activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="brokerageWalkaway"
            stroke="#f472b6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#f472b6' }}
            activeDot={{ r: 5, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
