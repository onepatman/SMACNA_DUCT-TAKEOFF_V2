import { useEffect, useMemo, useState } from 'react';
import './App.css';
import type { DuctRun } from './lib/smacnaDuctCalc';
import { calculateRun, aggregateTotals, emptyRun } from './lib/smacnaDuctCalc';
import RunInputTable from './components/RunInputTable';
import ResultsTable from './components/ResultsTable';
import ReferenceTab from './components/ReferenceTab';

let nextId = 1;

export default function App() {
  const [tab, setTab] = useState<'calc' | 'reference'>('calc');
  const [runs, setRuns] = useState<DuctRun[]>([emptyRun(String(nextId++))]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const results = useMemo(() => runs.map(calculateRun), [runs]);
  const totals = useMemo(() => aggregateTotals(results), [results]);

  const handleChange = (id: string, field: keyof DuctRun, value: string) => {
    setRuns((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'run' || field === 'type') return { ...r, [field]: value };
        return { ...r, [field]: parseFloat(value) || 0 };
      })
    );
  };

  const handleAdd = () => setRuns((prev) => [...prev, emptyRun(String(nextId++))]);
  const handleRemove = (id: string) => setRuns((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  return (
    <div className="app-shell">
      {installPrompt && (
        <div className="install-banner">
          <span>Install this calculator as an app for offline use.</span>
          <button
            onClick={async () => {
              installPrompt.prompt();
              await installPrompt.userChoice;
              setInstallPrompt(null);
            }}
          >
            Install App
          </button>
        </div>
      )}
      <header className="app-header">
        <div>
          <h1>SMACNA Rectangular Duct Material Takeoff</h1>
          <div className="subtitle">Duct_SMACNA · Material Takeoff Calculator</div>
        </div>
        <button className="btn" onClick={() => window.print()}>Save as PDF</button>
      </header>
      <nav className="tab-nav">
        <button className={tab === 'calc' ? 'active' : ''} onClick={() => setTab('calc')}>Calculator</button>
        <button className={tab === 'reference' ? 'active' : ''} onClick={() => setTab('reference')}>Reference</button>
      </nav>

      {tab === 'calc' ? (
        <>
          <RunInputTable runs={runs} onChange={handleChange} onAdd={handleAdd} onRemove={handleRemove} />
          <ResultsTable results={results} totals={totals} />
        </>
      ) : (
        <ReferenceTab />
      )}
    </div>
  );
}
