export const MEASURE_OPTIONS = [
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "unit", label: "unit(s)" },
  { value: "tbsp", label: "tbsp" },
  { value: "tsp", label: "tsp" },
  { value: "cup", label: "cup" },
  { value: "pinch", label: "pinch" },
];

const MEASURE_ALIASES = {
  g: ["g", "gram", "grams", "gr"],
  ml: ["ml", "milliliter", "milliliters", "millilitre", "millilitres"],
  unit: ["unit", "units", "piece", "pieces", "pcs", "pc"],
  tbsp: ["tbsp", "tbs", "tablespoon", "tablespoons", "tb"],
  tsp: ["tsp", "ts", "teaspoon", "teaspoons"],
  cup: ["cup", "cups"],
  pinch: ["pinch", "pinches"],
};

const MEASURE_LABELS = Object.fromEntries(
  MEASURE_OPTIONS.map(({ value, label }) => [value, label])
);

export function normalizeMeasure(measure) {
  if (!measure) return "";
  const key = measure.toString().trim().toLowerCase();
  for (const [canonical, aliases] of Object.entries(MEASURE_ALIASES)) {
    if (aliases.includes(key)) return canonical;
  }
  return key;
}

export function formatMeasureDisplay(measure) {
  const canonical = normalizeMeasure(measure);
  return MEASURE_LABELS[canonical] || measure;
}
