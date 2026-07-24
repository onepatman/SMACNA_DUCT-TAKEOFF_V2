import type { DuctRun } from '../lib/smacnaDuctCalc';

interface Props {
  runs: DuctRun[];
  onChange: (id: string, field: keyof DuctRun, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export default function RunInputTable({ runs, onChange, onAdd, onRemove }: Props) {
  return (
    <div className="section">
      <div className="section-header">
        <span className="badge">1</span> Input Parameters — Duct Runs
      </div>
      <div className="section-body">
        <div className="legend-box">
          <strong>Legend:</strong> Width/Depth in mm · Length in m. Add one row per duct run/segment.
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={onAdd}>+ Add Run</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Type</th>
              <th>Width (mm)</th>
              <th>Depth (mm)</th>
              <th>Length (m)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td><input type="text" value={r.run} onChange={(e) => onChange(r.id, 'run', e.target.value)} placeholder="D-1" /></td>
                <td>
                  <select value={r.type} onChange={(e) => onChange(r.id, 'type', e.target.value)}>
                    <option>Supply</option>
                    <option>Return</option>
                    <option>Exhaust</option>
                    <option>Fresh Air</option>
                  </select>
                </td>
                <td><input type="number" value={r.width_mm || ''} onChange={(e) => onChange(r.id, 'width_mm', e.target.value)} /></td>
                <td><input type="number" value={r.depth_mm || ''} onChange={(e) => onChange(r.id, 'depth_mm', e.target.value)} /></td>
                <td><input type="number" value={r.length_m || ''} onChange={(e) => onChange(r.id, 'length_m', e.target.value)} /></td>
                <td className="row-actions">
                  <button onClick={() => onRemove(r.id)} title="Remove run">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
