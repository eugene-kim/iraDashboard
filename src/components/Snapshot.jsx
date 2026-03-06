function fmt(v) {
  return '$' + Math.round(v).toLocaleString();
}

function LineItem({ label, value, className, total, tip }) {
  return (
    <div className={`line-item${total ? ' total' : ''}`}>
      <span>
        {label}
        {tip && (
          <span className="line-tip-wrapper">
            <span className="line-tip-icon">?</span>
            <span className="line-tip">{tip}</span>
          </span>
        )}
      </span>
      <span className={className}>{value}</span>
    </div>
  );
}

function FormulaTooltip({ lines }) {
  return (
    <span className="info-icon-wrapper">
      <span className="info-icon">i</span>
      <div className="formula-tooltip">
        {lines.map((line, i) => (
          <div key={i} className="formula-line">{line}</div>
        ))}
      </div>
    </span>
  );
}

export default function Snapshot({ row, params, locked }) {
  if (!row) return (
    <div className="snapshot">
      <h2>Hover over the chart to see a snapshot</h2>
    </div>
  );

  const before59 = row.age < 59.5;
  const label = before59 ? 'Before 59\u00BD' : 'After 59\u00BD';
  const taxableGains = Math.max(0, row.brokerageGains - row.brokerageLossCarryover);

  const rate = `${params.growthRate}%`;
  const taxRate = `${params.incomeTaxRate}%`;
  const ltcg = `${params.ltcgRate}%`;
  const penaltyRate = `${params.incomeTaxRate + 10}%`;

  const rothFormulas = [
    `Gross = prev \u00D7 (1 + ${rate}) + contribution = ${fmt(row.rothGross)}`,
    `Contributions = cumulative = ${fmt(row.rothContributions)}`,
    `Earnings = Gross \u2212 Contributions = ${fmt(row.rothGross)} \u2212 ${fmt(row.rothContributions)} = ${fmt(row.rothEarnings)}`,
  ];
  if (before59 && row.rothPenalty > 0) {
    rothFormulas.push(
      `Penalty = Earnings \u00D7 (${taxRate} + 10%) = ${fmt(row.rothEarnings)} \u00D7 ${penaltyRate} = ${fmt(row.rothPenalty)}`
    );
    rothFormulas.push(
      `Walk away = Gross \u2212 Penalty = ${fmt(row.rothGross)} \u2212 ${fmt(row.rothPenalty)} = ${fmt(row.rothWalkaway)}`
    );
  } else {
    rothFormulas.push(`Walk away = Gross (no penalty after 59\u00BD) = ${fmt(row.rothWalkaway)}`);
  }

  const brokerageFormulas = [
    `Gross = prev \u00D7 (1 + growth) + divs \u2212 divTax + contribution = ${fmt(row.brokerageGross)}`,
    `Cost basis = contributions + after-tax dividends = ${fmt(row.brokerageCostBasis)}`,
    `Gains = Gross \u2212 Cost basis = ${fmt(row.brokerageGross)} \u2212 ${fmt(row.brokerageCostBasis)} = ${fmt(row.brokerageGains)}`,
    `Taxable gains = max(0, Gains \u2212 Loss carryover) = max(0, ${fmt(row.brokerageGains)} \u2212 ${fmt(row.brokerageLossCarryover)}) = ${fmt(taxableGains)}`,
  ];
  if (row.brokerageTaxOwed > 0) {
    brokerageFormulas.push(
      `Tax owed = Taxable gains \u00D7 ${ltcg} = ${fmt(taxableGains)} \u00D7 ${ltcg} = ${fmt(row.brokerageTaxOwed)}`
    );
  }
  brokerageFormulas.push(
    `Walk away = Gross \u2212 Tax owed = ${fmt(row.brokerageGross)} \u2212 ${fmt(row.brokerageTaxOwed)} = ${fmt(row.brokerageWalkaway)}`
  );

  return (
    <div className="snapshot">
      <h2>
        Snapshot at Age {row.age} ({label})
        {locked && <span className="pinned-badge">pinned - click chart to unpin</span>}
      </h2>

      <div className="snapshot-card">
        <h3>
          <span className="dot" style={{ background: '#8b5cf6' }} />
          Roth IRA
          <FormulaTooltip lines={rothFormulas} />
        </h3>
        <LineItem label="Gross balance" value={fmt(row.rothGross)} tip="Total account value before any taxes or penalties" />
        <LineItem label="Contributions (free)" value={fmt(row.rothContributions)} className="text-green" tip="Money you put in — always withdrawable tax-free" />
        <LineItem
          label={`Earnings (${before59 ? 'penalized' : 'free'})`}
          value={fmt(row.rothEarnings)}
          className={before59 ? 'text-red' : 'text-green'}
          tip={before59 ? 'Investment growth — subject to tax + 10% penalty before 59\u00BD' : 'Investment growth — tax-free after 59\u00BD'}
        />
        {before59 && row.rothPenalty > 0 && (
          <LineItem label="Penalty + tax on earnings" value={`-${fmt(row.rothPenalty)}`} className="text-red" tip="Income tax + 10% early withdrawal penalty on earnings only" />
        )}
        <LineItem label="Walk away with" value={fmt(row.rothWalkaway)} total tip="What you actually keep after all taxes and penalties" />
      </div>

      <div className="snapshot-card">
        <h3>
          <span className="dot" style={{ background: '#f472b6' }} />
          Brokerage
          <FormulaTooltip lines={brokerageFormulas} />
        </h3>
        <LineItem label="Gross balance" value={fmt(row.brokerageGross)} tip="Total account value including reinvested dividends" />
        <LineItem label="Cost basis (free)" value={fmt(row.brokerageCostBasis)} tip="Your contributions + after-tax dividends — not taxed again on sale" />
        <LineItem label="Gains" value={fmt(row.brokerageGains)} className="text-green" tip="Growth above your cost basis — potentially taxable on sale" />
        {row.brokerageLossCarryover > 0 && (
          <LineItem label="Loss carryover remaining" value={fmt(row.brokerageLossCarryover)} className="text-red" tip="Capital losses carried forward to offset future gains" />
        )}
        <LineItem label="Taxable gains" value={fmt(taxableGains)} tip="Gains after subtracting any remaining loss carryover" />
        {row.brokerageTaxOwed > 0 && (
          <LineItem label="Tax owed" value={`-${fmt(row.brokerageTaxOwed)}`} className="text-red" tip="Long-term capital gains tax on taxable gains" />
        )}
        <LineItem label="Walk away with" value={fmt(row.brokerageWalkaway)} total tip="What you actually keep after selling and paying capital gains tax" />
      </div>

      <div className="snapshot-footer">
        {fmt(row.brokerageLossCarryover)} loss carryover remaining at age {row.age}
      </div>
    </div>
  );
}
