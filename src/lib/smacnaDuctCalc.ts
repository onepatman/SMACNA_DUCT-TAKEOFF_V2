/**
 * SMACNA Rectangular Duct Material Takeoff — calculation engine
 * ---------------------------------------------------------------
 * Source of truth: ME_DUCT_SMACNA.xls (Duct_SMACNA sheet), which contained
 * only column headers and a duct-size-to-gauge reference table — no
 * formulas. Every formula below was built fresh and is flagged where it
 * rests on an assumption rather than a value taken from the source file.
 *
 * Kept independent of any UI framework (Section 11 of the migration spec)
 * so it can be imported and unit-tested on its own.
 */

export type GaugeKey = 'ga26' | 'ga24' | 'ga22' | 'ga20' | 'ga18';

export const GAUGE_LABELS: Record<GaugeKey, string> = {
  ga26: 'Gauge 26',
  ga24: 'Gauge 24',
  ga22: 'Gauge 22',
  ga20: 'Gauge 20',
  ga18: 'Gauge 18',
};

export interface DuctRun {
  id: string;
  run: string;
  type: string;
  width_mm: number;
  depth_mm: number;
  length_m: number;
}

export interface MaterialQuantities {
  insulation_sqm: number;
  sealant_gal: number;
  adhesive_gal: number;
  ductPin_pcs: number;
  ductTape_rolls: number; // 20yd rolls, matches source template's unit
  strap_pcs: number;
  corner_sqm: number; // source template lists this column's unit as "sq m" — preserved as-is, see README
  angle_m: number;
  rod_m: number;
  cncInsert_pcs: number;
  nuts_pcs: number;
  washers_pcs: number;
}

export interface DuctRunResult extends DuctRun {
  perimeter_m: number;
  area_sqm: number;
  gauge: GaugeKey | null; // null when dimension exceeds the table (out of standard range)
  gaugeArea: Record<GaugeKey, number>;
  gaugeIsAssumption: boolean; // true when the dimension fell in a gap in the source table
  outOfRange: boolean;
  materials: MaterialQuantities;
}

/**
 * GAUGE SELECTION
 * ---------------
 * Bands are exactly as given in the source workbook:
 *   ≤300mm → Ga26 · 325–450mm → Ga24 · 775–1350mm → Ga22 ·
 *   1375–2100mm → Ga20 · 2115–3050mm → Ga18
 *
 * The workbook itself has gaps between bands. Small gaps (≤25mm, almost
 * certainly rounding in whoever transcribed the original SMACNA table) are
 * bridged automatically. The one substantial gap — 451mm to 774mm, between
 * the Ga24 and Ga22 bands — has no value in the source and no safe way to
 * infer one, so it defaults conservatively to the heavier gauge (Ga22) and
 * is flagged via `gaugeIsAssumption`. CONFIRM this against your SMACNA
 * edition and the system's pressure class (this table doesn't state one —
 * gauge selection normally depends on pressure class too, not dimension
 * alone) and adjust the band below if needed.
 */
const GAUGE_BANDS: { max: number; gauge: GaugeKey }[] = [
  { max: 300, gauge: 'ga26' },
  { max: 450, gauge: 'ga24' },
  { max: 1350, gauge: 'ga22' },
  { max: 2100, gauge: 'ga20' },
  { max: 3050, gauge: 'ga18' },
];

const UNRESOLVED_GAP = { min: 451, max: 774 };

export function selectGauge(
  width_mm: number,
  depth_mm: number
): { gauge: GaugeKey | null; isAssumption: boolean; outOfRange: boolean } {
  const dim = Math.max(width_mm, depth_mm);
  if (dim > 3050) {
    return { gauge: null, isAssumption: false, outOfRange: true };
  }
  const band = GAUGE_BANDS.find((b) => dim <= b.max) ?? GAUGE_BANDS[GAUGE_BANDS.length - 1];
  const isAssumption = dim >= UNRESOLVED_GAP.min && dim <= UNRESOLVED_GAP.max;
  return { gauge: band.gauge, isAssumption, outOfRange: false };
}

/**
 * MATERIAL TAKEOFF RATES — every value here is a placeholder assumption.
 * None of this existed in the source file (it had empty columns only).
 * This is the one place to edit once you confirm your own estimating
 * rates; everything below reads from these constants.
 */
export const MATERIAL_RATES = {
  insulationCoverageFactor: 1.0, // sq m insulation per sq m duct surface (1.0 = full wrap, all 4 sides) — CONFIRM
  standardJointSpacing_m: 2.4, // m per transverse joint (typical 2.4m / 8ft duct section) — CONFIRM
  sealantRate_galPerJointM: 0.008, // gal sealant per linear m of transverse joint — CONFIRM (product-dependent)
  adhesiveRate_galPer100sqm: 1.0, // gal adhesive per 100 sq m of insulation face — CONFIRM
  ductPinPerSqm: 2.0, // pcs duct pins per sq m of insulated surface — CONFIRM
  tapeRollPer_m_ofJoint: 0.05, // 20yd rolls per linear m of joint/seam — CONFIRM
  strapPerJoint: 2, // pcs hanger strap per transverse joint — CONFIRM against SMACNA Table 4-1 hanger spacing for your pressure class
  cornerPerJoint: 4, // pcs corner pieces per transverse joint (4 corners per rectangular joint) — CONFIRM
  hangerSpacing_m: 3.0, // m between hanger points — CONFIRM against SMACNA Table 4-1 for your pressure class
  anglePerHanger_m: 0.6, // m angle-iron reinforcement per hanger point — CONFIRM
  rodPerHanger_m: 0.3, // m rod per hanger point — CONFIRM
  cncInsertPerHanger: 2, // pcs per hanger point — CONFIRM
  nutsPerHanger: 4, // pcs per hanger point — CONFIRM
  washersPerHanger: 4, // pcs per hanger point — CONFIRM
};

export function calculateRun(run: DuctRun): DuctRunResult {
  const perimeter_m = 2 * (run.width_mm + run.depth_mm) / 1000;
  const area_sqm = perimeter_m * run.length_m;

  const { gauge, isAssumption, outOfRange } = selectGauge(run.width_mm, run.depth_mm);

  const gaugeArea: Record<GaugeKey, number> = { ga26: 0, ga24: 0, ga22: 0, ga20: 0, ga18: 0 };
  if (gauge) gaugeArea[gauge] = area_sqm;

  const joints = run.length_m > 0 ? Math.max(1, Math.ceil(run.length_m / MATERIAL_RATES.standardJointSpacing_m)) : 0;
  const jointLength_m = joints * perimeter_m;
  const hangers = run.length_m > 0 ? Math.max(1, Math.ceil(run.length_m / MATERIAL_RATES.hangerSpacing_m)) : 0;
  const insulation_sqm = area_sqm * MATERIAL_RATES.insulationCoverageFactor;

  const materials: MaterialQuantities = {
    insulation_sqm,
    sealant_gal: jointLength_m * MATERIAL_RATES.sealantRate_galPerJointM,
    adhesive_gal: (insulation_sqm / 100) * MATERIAL_RATES.adhesiveRate_galPer100sqm,
    ductPin_pcs: Math.ceil(area_sqm * MATERIAL_RATES.ductPinPerSqm),
    ductTape_rolls: jointLength_m * MATERIAL_RATES.tapeRollPer_m_ofJoint,
    strap_pcs: joints * MATERIAL_RATES.strapPerJoint,
    corner_sqm: joints * MATERIAL_RATES.cornerPerJoint,
    angle_m: hangers * MATERIAL_RATES.anglePerHanger_m,
    rod_m: hangers * MATERIAL_RATES.rodPerHanger_m,
    cncInsert_pcs: hangers * MATERIAL_RATES.cncInsertPerHanger,
    nuts_pcs: hangers * MATERIAL_RATES.nutsPerHanger,
    washers_pcs: hangers * MATERIAL_RATES.washersPerHanger,
  };

  return {
    ...run,
    perimeter_m,
    area_sqm,
    gauge,
    gaugeArea,
    gaugeIsAssumption: isAssumption,
    outOfRange,
    materials,
  };
}

export interface Totals {
  gaugeArea: Record<GaugeKey, number>;
  materials: MaterialQuantities;
  totalArea_sqm: number;
}

export function aggregateTotals(results: DuctRunResult[]): Totals {
  const gaugeArea: Record<GaugeKey, number> = { ga26: 0, ga24: 0, ga22: 0, ga20: 0, ga18: 0 };
  const materials: MaterialQuantities = {
    insulation_sqm: 0,
    sealant_gal: 0,
    adhesive_gal: 0,
    ductPin_pcs: 0,
    ductTape_rolls: 0,
    strap_pcs: 0,
    corner_sqm: 0,
    angle_m: 0,
    rod_m: 0,
    cncInsert_pcs: 0,
    nuts_pcs: 0,
    washers_pcs: 0,
  };
  let totalArea_sqm = 0;

  for (const r of results) {
    totalArea_sqm += r.area_sqm;
    (Object.keys(gaugeArea) as GaugeKey[]).forEach((g) => {
      gaugeArea[g] += r.gaugeArea[g];
    });
    (Object.keys(materials) as (keyof MaterialQuantities)[]).forEach((k) => {
      materials[k] += r.materials[k];
    });
  }

  return { gaugeArea, materials, totalArea_sqm };
}

export function emptyRun(id: string): DuctRun {
  return { id, run: '', type: 'Supply', width_mm: 0, depth_mm: 0, length_m: 0 };
}
