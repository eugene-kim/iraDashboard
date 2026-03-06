import { useState, useMemo } from 'react';
import './App.css';
import { calculate } from './utils/calculate';
import Controls from './components/Controls';
import WalkawayChart from './components/WalkawayChart';
import Snapshot from './components/Snapshot';

const defaultParams = {
  currentAge: 35,
  endAge: 65,
  annualContribution: 7000,
  growthRate: 7,
  incomeTaxRate: 24,
  ltcgRate: 15,
  dividendYield: 1.3,
  capitalLossCarryover: 114000,
};

function App() {
  const [params, setParams] = useState(defaultParams);
  const [hoveredAge, setHoveredAge] = useState(null);
  const [lockedAge, setLockedAge] = useState(null);

  const data = useMemo(() => calculate(params), [params]);

  const activeAge = lockedAge ?? hoveredAge;
  const snapshotRow = activeAge
    ? data.find(r => r.age === activeAge)
    : data[data.length - 1];

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleClickAge = (age) => {
    setLockedAge(prev => prev === age ? null : age);
  };

  return (
    <>
      <h1>Roth IRA vs Brokerage: Net Walkaway Value</h1>
      <Controls params={params} onChange={handleParamChange} />
      <WalkawayChart
        data={data}
        onHoverAge={setHoveredAge}
        onClickAge={handleClickAge}
        onUnlock={() => setLockedAge(null)}
        lockedAge={lockedAge}
      />
      <Snapshot row={snapshotRow} params={params} locked={lockedAge != null} />
    </>
  );
}

export default App;
