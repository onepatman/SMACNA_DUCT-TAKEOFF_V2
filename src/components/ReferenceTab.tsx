import { MATERIAL_RATES } from '../lib/smacnaDuctCalc';

const RATE_ROWS: { key: keyof typeof MATERIAL_RATES; label: string; unit: string }[] = [
  { key: 'insulationCoverageFactor', label: 'Insulation coverage factor', unit: '× duct surface area' },
  { key: 'standardJointSpacing_m', label: 'Standard joint spacing', unit: 'm' },
  { key: 'sealantRate_galPerJointM', label: 'Sealant rate', unit: 'gal / linear m of joint' },
  { key: 'adhesiveRate_galPer100sqm', label: 'Adhesive rate', unit: 'gal / 100 sq m insulation face' },
  { key: 'ductPinPerSqm', label: 'Duct pins', unit: 'pcs / sq m insulated surface' },
  { key: 'tapeRollPer_m_ofJoint', label: 'Duct tape', unit: '20yd rolls / linear m of joint' },
  { key: 'strapPerJoint', label: 'Strap', unit: 'pcs / joint' },
  { key: 'cornerPerJoint', label: 'Corner pieces', unit: 'pcs (as sq m in template) / joint' },
  { key: 'hangerSpacing_m', label: 'Hanger spacing', unit: 'm' },
  { key: 'anglePerHanger_m', label: 'Angle iron reinforcement', unit: 'm / hanger point' },
  { key: 'rodPerHanger_m', label: 'Rod', unit: 'm / hanger point' },
  { key: 'cncInsertPerHanger', label: 'Cnc insert', unit: 'pcs / hanger point' },
  { key: 'nutsPerHanger', label: 'Nuts', unit: 'pcs / hanger point' },
  { key: 'washersPerHanger', label: 'Washers', unit: 'pcs / hanger point' },
];

export default function ReferenceTab() {
  return (
    <>
      <div className="section">
        <div className="section-header"><span className="badge">R1</span> Gauge Reference Table (source workbook)</div>
        <div className="section-body">
          <table className="data-table">
            <thead><tr><th>Duct Size (larger dimension)</th><th>Gauge</th></tr></thead>
            <tbody>
              <tr><td>2115mm – 3050mm</td><td>Gauge 18</td></tr>
              <tr><td>1375mm – 2100mm</td><td>Gauge 20</td></tr>
              <tr><td>775mm – 1350mm</td><td>Gauge 22</td></tr>
              <tr><td>325mm – 450mm</td><td>Gauge 24</td></tr>
              <tr><td>300mm and below</td><td>Gauge 26</td></tr>
              <tr className="row-flagged"><td>451mm – 774mm <span className="status-warn">GAP</span></td><td>Defaults to Ga22 — confirm</td></tr>
              <tr className="row-flagged"><td>Above 3050mm <span className="status-warn">GAP</span></td><td>Not covered — needs manual review</td></tr>
            </tbody>
          </table>
          <div className="legend-box" style={{ marginTop: '0.75rem' }}>
            This table doesn't state a static pressure class. SMACNA gauge selection depends on both dimension <em>and</em> pressure class — confirm which class (e.g. 2", 3" w.g.) and SMACNA edition this was drawn from.
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header"><span className="badge">R2</span> Material Takeoff Rate Assumptions</div>
        <div className="section-body">
          <div className="legend-box">
            None of these existed in the source workbook — it had empty columns only. Edit values in <code>src/lib/smacnaDuctCalc.ts</code> (constant <code>MATERIAL_RATES</code>) once confirmed; the whole app recalculates from that one place.
          </div>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Rate</th><th>Unit</th></tr></thead>
            <tbody>
              {RATE_ROWS.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{MATERIAL_RATES[row.key]}</td>
                  <td>{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
