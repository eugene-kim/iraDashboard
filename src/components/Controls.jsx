const sliders = [
  { key: 'currentAge', label: 'Current Age', min: 25, max: 55, step: 1 },
  { key: 'endAge', label: 'End Age', min: 40, max: 80, step: 1 },
  { key: 'annualContribution', label: 'Annual Contribution', min: 1000, max: 7000, step: 500, format: '$' },
  { key: 'growthRate', label: 'Growth Rate', min: 4, max: 12, step: 0.5, format: '%' },
  { key: 'incomeTaxRate', label: 'Income Tax Rate', min: 22, max: 37, step: 1, format: '%' },
  { key: 'ltcgRate', label: 'LTCG Rate', min: 0, max: 20, step: 1, format: '%' },
  { key: 'dividendYield', label: 'Dividend Yield', min: 0, max: 5, step: 0.1, format: '%' },
  { key: 'capitalLossCarryover', label: 'Capital Loss Carryover', min: 0, max: 500000, step: 1000, format: '$' },
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
          <label>{s.label}</label>
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
