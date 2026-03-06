export function calculate(params) {
  const {
    currentAge,
    endAge,
    annualContribution,
    growthRate,
    incomeTaxRate,
    ltcgRate,
    dividendYield,
    capitalLossCarryover,
  } = params;

  const results = [];
  const rate = growthRate / 100;
  const divYield = dividendYield / 100;
  const priceGrowth = rate - divYield;

  // Roth tracking
  let rothGross = 0;
  let rothContributions = 0;

  // Brokerage tracking
  let brokerageGross = 0;
  let brokerageCostBasis = 0;
  let lossCarryover = capitalLossCarryover;

  for (let age = currentAge; age <= endAge; age++) {
    // --- Roth IRA ---
    rothGross = rothGross * (1 + rate) + annualContribution;
    rothContributions += annualContribution;
    const rothEarnings = rothGross - rothContributions;

    let rothPenalty = 0;
    if (age < 59.5) {
      rothPenalty = Math.max(0, rothEarnings) * (incomeTaxRate / 100 + 0.10);
    }
    const rothWalkaway = rothGross - rothPenalty;

    // --- Brokerage ---
    // Grow existing balance: price appreciation + dividends
    const dividends = brokerageGross * divYield;
    brokerageGross = brokerageGross * (1 + priceGrowth) + dividends;

    // Tax on dividends
    const dividendTax = dividends * (ltcgRate / 100);

    // Reinvest after-tax dividends (dividends already in gross, remove tax portion)
    brokerageGross -= dividendTax;

    // Add new contribution
    brokerageGross += annualContribution;
    brokerageCostBasis += annualContribution;

    // After-tax dividends add to cost basis (they were already taxed)
    const afterTaxDividends = dividends - dividendTax;
    brokerageCostBasis += afterTaxDividends;

    // Walkaway calculation (uses carryover before this year's $3k deduction)
    const brokerageGains = brokerageGross - brokerageCostBasis;
    const taxableGains = Math.max(0, brokerageGains - lossCarryover);
    const brokerageTaxOwed = taxableGains * (ltcgRate / 100);
    const remainingLossCarryover = Math.max(0, lossCarryover - Math.max(0, brokerageGains));
    const brokerageWalkaway = brokerageGross - brokerageTaxOwed;

    // $3k annual ordinary income offset (applied for non-sale years going forward)
    lossCarryover = Math.max(0, lossCarryover - 3000);

    results.push({
      age,
      rothGross: round(rothGross),
      rothContributions: round(rothContributions),
      rothEarnings: round(rothEarnings),
      rothPenalty: round(rothPenalty),
      rothWalkaway: round(rothWalkaway),
      brokerageGross: round(brokerageGross),
      brokerageCostBasis: round(brokerageCostBasis),
      brokerageGains: round(brokerageGains),
      brokerageTaxableGains: round(taxableGains),
      brokerageLossCarryover: round(remainingLossCarryover),
      brokerageTaxOwed: round(brokerageTaxOwed),
      brokerageWalkaway: round(brokerageWalkaway),
    });
  }

  return results;
}

function round(v) {
  return Math.round(v * 100) / 100;
}
