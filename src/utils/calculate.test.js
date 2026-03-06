import { describe, it, expect } from 'vitest';
import { calculate } from './calculate';

const defaults = {
  currentAge: 35,
  endAge: 65,
  annualContribution: 7000,
  growthRate: 7,
  incomeTaxRate: 35,
  ltcgRate: 20,
  dividendYield: 1.5,
  capitalLossCarryover: 114000,
};

describe('calculate', () => {
  it('Roth basics after 1 year', () => {
    const results = calculate({ ...defaults, endAge: 35 });
    expect(results).toHaveLength(1);
    const row = results[0];
    expect(row.rothGross).toBe(7000);
    expect(row.rothContributions).toBe(7000);
    expect(row.rothEarnings).toBe(0);
  });

  it('Roth after 2 years with known growth', () => {
    const results = calculate({ ...defaults, growthRate: 10, endAge: 36, dividendYield: 0 });
    const row = results[1];
    // Year 1: 7000, Year 2: 7000*1.1 + 7000 = 14700
    expect(row.rothGross).toBe(14700);
    expect(row.rothContributions).toBe(14000);
    expect(row.rothEarnings).toBe(700);
  });

  it('Roth before 59.5: penalty on earnings', () => {
    const results = calculate({ ...defaults, endAge: 36, dividendYield: 0 });
    const row = results[1]; // age 36
    const expectedEarnings = row.rothEarnings;
    const expectedPenalty = expectedEarnings * (0.35 + 0.10);
    expect(row.rothPenalty).toBeCloseTo(expectedPenalty, 2);
    expect(row.rothWalkaway).toBeCloseTo(row.rothGross - row.rothPenalty, 2);
  });

  it('Roth after 59.5: no penalty', () => {
    const results = calculate({ ...defaults, currentAge: 59, endAge: 60 });
    const row = results[1]; // age 60
    expect(row.rothPenalty).toBe(0);
    expect(row.rothWalkaway).toBe(row.rothGross);
  });

  it('Brokerage dividend drag: balance < Roth gross', () => {
    const results = calculate({ ...defaults, endAge: 50 });
    const last = results[results.length - 1];
    expect(last.brokerageGross).toBeLessThan(last.rothGross);
  });

  it('Brokerage cost basis includes contributions + reinvested after-tax dividends', () => {
    const results = calculate({ ...defaults, endAge: 36 });
    const row = results[1]; // age 36
    // Cost basis should be > 14000 (2 years of contributions) due to reinvested dividends
    expect(row.brokerageCostBasis).toBeGreaterThan(14000);
  });

  it('Brokerage loss carryover consumption: tax owed = 0 with large carryover', () => {
    const results = calculate({ ...defaults, endAge: 40 });
    const last = results[results.length - 1];
    // With $114k carryover and only 6 years of $7k contributions, gains are small
    expect(last.brokerageTaxOwed).toBe(0);
    expect(last.brokerageLossCarryover).toBeGreaterThan(0);
  });

  it('Brokerage loss carryover exhausted: tax kicks in', () => {
    const results = calculate({ ...defaults, capitalLossCarryover: 1000, endAge: 65 });
    const last = results[results.length - 1];
    expect(last.brokerageTaxOwed).toBeGreaterThan(0);
  });

  it('$3k annual ordinary income offset reduces carryover', () => {
    const results = calculate({ ...defaults, endAge: 36, growthRate: 0, dividendYield: 0 });
    // After 2 years: carryover should be 114000 - 3000 - 3000 = 108000
    const last = results[results.length - 1];
    expect(last.brokerageLossCarryover).toBe(108000);
  });

  it('Zero growth rate: contributions only, no penalties or gains', () => {
    const results = calculate({ ...defaults, growthRate: 0, dividendYield: 0, endAge: 40 });
    const last = results[results.length - 1];
    expect(last.rothGross).toBe(7000 * 6);
    expect(last.rothEarnings).toBe(0);
    expect(last.rothPenalty).toBe(0);
    expect(last.brokerageGross).toBe(7000 * 6);
    expect(last.brokerageGains).toBe(0);
    expect(last.brokerageTaxOwed).toBe(0);
  });

  it('Carryover offsets gains above $3k with no cap', () => {
    // Large growth + large carryover: gains will far exceed $3k but carryover should wipe them out
    const results = calculate({
      ...defaults,
      growthRate: 12,
      dividendYield: 0,
      capitalLossCarryover: 500000,
      endAge: 50,
    });
    const last = results[results.length - 1];
    // 16 years of 12% growth on $7k/yr produces significant gains (well above $3k)
    expect(last.brokerageGains).toBeGreaterThan(50000);
    // But $500k carryover (minus $3k*16yr = $48k ordinary offsets = $452k remaining) dwarfs the gains
    expect(last.brokerageTaxOwed).toBe(0);
    expect(last.brokerageLossCarryover).toBeGreaterThan(0);
  });

  it('Crossover: brokerage wins before 59.5, Roth wins after', () => {
    const results = calculate(defaults);
    const before59 = results.find(r => r.age === 55);
    expect(before59.brokerageWalkaway).toBeGreaterThan(before59.rothWalkaway);

    const after59 = results.find(r => r.age === 65);
    expect(after59.rothWalkaway).toBeGreaterThan(after59.brokerageWalkaway);
  });
});
