import type { DuctRunResult, Totals, GaugeKey } from '../lib/smacnaDuctCalc';
import { GAUGE_LABELS } from '../lib/smacnaDuctCalc';

interface Props {
  results: DuctRunResult[];
  totals: Totals;
}

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
const gaugeKeys: GaugeKey[] = ['ga26', 'ga24', 'ga22', 'ga20', 'ga18'];

export default function ResultsTable({ results, totals }: Props) {
  const anyAssumption = results.some((r) => r.gaugeIsAssumption);
  const anyOutOfRange = results.some((r) => r.outOfRange);

  return (
    <div className="section">
      <div className="section-header">
        <span className="badge">2</span> Results — Geometry, Gauge & Material Takeoff
      </div>
      <div className="section-body">
        <div className="formula-box">
          Perimeter (m) = 2 × (Width + Depth) / 1000<br />
          Area (sq m) = Perimeter × Length<br />
          Gauge = lookup(max(Width, Depth)) against the duct-size table
        </div>

        {(anyAssumption || anyOutOfRange) && (
          <div className="legend-box row-flagged">
            {anyAssumption && <div><span className="status-warn">ASSUMPTION</span> One or more runs fall in the 451–774mm gap the source table doesn't cover — defaulted to the heavier gauge (Ga22). Confirm against your SMACNA edition/pressure class.</div>}
            {anyOutOfRange && <div style={{ marginTop: 4 }}><span className="status-warn">REVIEW</span> One or more runs exceed 3050mm — outside the source table's range. Gauge not assigned; needs manual engineering review.</div>}
          </div>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Type</th>
              <th>Perimeter (m)</th>
              <th>Area (sq m)</th>
              <th>Gauge</th>
              <th>Insul. (sq m)</th>
              <th>Sealant (gal)</th>
              <th>Adhesive (gal)</th>
              <th>Duct Pin (pcs)</th>
              <th>Tape (rolls)</th>
              <th>Strap (pcs)</th>
              <th>Corner (sq m)</th>
              <th>Angle (m)</th>
              <th>Rod (m)</th>
              <th>Insert (pcs)</th>
              <th>Nuts (pcs)</th>
              <th>Washers (pcs)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className={r.gaugeIsAssumption || r.outOfRange ? 'row-flagged' : undefined}>
                <td>{r.run || '—'}</td>
                <td>{r.type}</td>
                <td>{fmt(r.perimeter_m)}</td>
                <td>{fmt(r.area_sqm)}</td>
                <td>{r.gauge ? GAUGE_LABELS[r.gauge] : <span className="status-warn">REVIEW</span>}</td>
                <td>{fmt(r.materials.insulation_sqm)}</td>
                <td>{fmt(r.materials.sealant_gal, 3)}</td>
                <td>{fmt(r.materials.adhesive_gal, 3)}</td>
                <td>{r.materials.ductPin_pcs}</td>
                <td>{fmt(r.materials.ductTape_rolls, 2)}</td>
                <td>{r.materials.strap_pcs}</td>
                <td>{r.materials.corner_sqm}</td>
                <td>{fmt(r.materials.angle_m)}</td>
                <td>{fmt(r.materials.rod_m)}</td>
                <td>{r.materials.cncInsert_pcs}</td>
                <td>{r.materials.nuts_pcs}</td>
                <td>{r.materials.washers_pcs}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="conclusion-bar">
          <div>
            Total Duct Area: <span className="result-box">{fmt(totals.totalArea_sqm)} sq m</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {gaugeKeys.map((g) => (
              <span key={g}>{GAUGE_LABELS[g]}: <strong>{fmt(totals.gaugeArea[g])} sq m</strong></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
