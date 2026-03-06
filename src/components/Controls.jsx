const sliders = [
  { key: 'currentAge', label: 'Current Age', min: 25, max: 55, step: 1, tip: 'Your age today' },
  { key: 'endAge', label: 'End Age', min: 40, max: 80, step: 1, tip: 'Age you plan to stop investing or retire' },
  { key: 'annualContribution', label: 'Annual Contribution', min: 1000, max: 7000, step: 500, format: '$', tip: '2025 Roth IRA max is $7,000 ($8,000 if 50+)' },
  { key: 'growthRate', label: 'Growth Rate', min: 4, max: 12, step: 0.5, format: '%', tip: 'Total return (price + dividends). 7% is the long-run real S&P 500 average' },
  { key: 'incomeTaxRate', label: 'Income Tax Rate', min: 22, max: 37, step: 1, format: '%', tip: 'Your marginal federal income tax bracket. Applied to early Roth withdrawals' },
  { key: 'ltcgRate', label: 'LTCG Rate', min: 0, max: 20, step: 1, format: '%', tip: 'Long-term capital gains rate. 0%, 15%, or 20% depending on income' },
  { key: 'dividendYield', label: 'Dividend Yield', min: 0, max: 5, step: 0.1, format: '%', tip: 'Portion of total return paid as dividends. S&P 500 currently ~1.3%' },
  { key: 'capitalLossCarryover', label: 'Capital Loss Carryover', min: 0, max: 500000, step: 1000, format: '$', tip: 'Accumulated capital losses from prior years that offset future gains' },
];

function formatValue(val, format) {
  if (format === '$') return `$${Number(val).toLocaleString()}`;
  if (format === '%') return `${val}%`;
  return val;
}

export default function Controls({ params, onChange }) {
  return (
    <div className="controls">
      {sliders.map(s => (
        <div key={s.key} className="control-group">
          <label>
            {s.label}
            <span className="line-tip-wrapper">
              <span className="line-tip-icon">?</span>
              <span className="line-tip">{s.tip}</span>
            </span>
          </label>
          <span className="value">{formatValue(params[s.key], s.format)}</span>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={params[s.key]}
            onChange={e => onChange(s.key, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}
