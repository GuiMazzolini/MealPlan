import catalog from "../data/ingredients.json";
import { normalizeMeasure } from "../constants/measures";

const STATIC_ALIAS_TO_ID = new Map();
const STATIC_ID_TO_LABEL = new Map();

catalog.forEach((entry) => {
  STATIC_ID_TO_LABEL.set(entry.id, entry.label);
  STATIC_ALIAS_TO_ID.set(normalizeText(entry.label), entry.id);
  STATIC_ALIAS_TO_ID.set(normalizeText(entry.id), entry.id);
  (entry.aliases || []).forEach((alias) => {
    STATIC_ALIAS_TO_ID.set(normalizeText(alias), entry.id);
  });
});

const STATIC_IDS = new Set(catalog.map((entry) => entry.id));

function normalizeText(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toTitleCase(value) {
  return normalizeText(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function simpleSingularize(value) {
  const word = normalizeText(value);
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 2) {
    return word.slice(0, -1);
  }
  return word;
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function lookupInRegistry(input, registry) {
  const normalized = normalizeText(input);
  if (registry.aliasMap.has(normalized)) {
    return registry.aliasMap.get(normalized);
  }

  if (normalized.endsWith("s") && normalized.length > 3) {
    const withoutS = normalized.slice(0, -1);
    if (registry.aliasMap.has(withoutS)) {
      return registry.aliasMap.get(withoutS);
    }
  }

  return null;
}

function resolveWithRegistry(input, registry) {
  const original = input.trim();
  if (!original) {
    return { canonical: "", display: "", matched: false, original: "" };
  }

  const catalogId = lookupInRegistry(original, registry);
  if (catalogId) {
    const display = registry.labelMap.get(catalogId);
    return {
      canonical: catalogId,
      display,
      matched: true,
      original,
      wasCorrected: normalizeText(original) !== normalizeText(display),
      source: STATIC_IDS.has(catalogId) ? "catalog" : "community",
    };
  }

  const customCanonical = simpleSingularize(original);
  const display = toTitleCase(customCanonical);

  return {
    canonical: customCanonical,
    display,
    matched: false,
    original,
    wasCorrected: normalizeText(original) !== normalizeText(display),
    source: "custom",
  };
}

export function buildIngredientRegistry(recipes = []) {
  const aliasMap = new Map(STATIC_ALIAS_TO_ID);
  const labelMap = new Map(STATIC_ID_TO_LABEL);
  const communityEntries = [];

  const rawNames = new Set();
  recipes.forEach((recipe) => {
    (recipe.ingredients || []).forEach((item) => {
      if (item.ingredient?.trim()) {
        rawNames.add(item.ingredient.trim());
      }
    });
  });

  rawNames.forEach((raw) => {
    const staticId = lookupInRegistry(raw, { aliasMap: STATIC_ALIAS_TO_ID, labelMap: STATIC_ID_TO_LABEL });
    const resolved = staticId
      ? {
          canonical: staticId,
          display: STATIC_ID_TO_LABEL.get(staticId),
        }
      : {
          canonical: simpleSingularize(raw),
          display: toTitleCase(simpleSingularize(raw)),
        };

    aliasMap.set(normalizeText(raw), resolved.canonical);
    aliasMap.set(normalizeText(resolved.display), resolved.canonical);
    aliasMap.set(normalizeText(resolved.canonical), resolved.canonical);

    if (!labelMap.has(resolved.canonical)) {
      labelMap.set(resolved.canonical, resolved.display);
      if (!STATIC_IDS.has(resolved.canonical)) {
        communityEntries.push({
          id: resolved.canonical,
          label: resolved.display,
          aliases: [],
          source: "community",
        });
      }
    }
  });

  const mergedCatalog = [
    ...catalog.map((entry) => ({ ...entry, source: "catalog" })),
    ...communityEntries,
  ];

  return { aliasMap, labelMap, mergedCatalog, communityEntries };
}

export function getIngredientCatalog(recipes = []) {
  return buildIngredientRegistry(recipes).mergedCatalog;
}

export function getIngredientSuggestions(query, recipes = [], limit = 8) {
  const registry = buildIngredientRegistry(recipes);
  const normalized = normalizeText(query);
  if (!normalized) return registry.mergedCatalog.slice(0, limit);

  const scored = registry.mergedCatalog
    .map((entry) => {
      const terms = [entry.label, entry.id, ...(entry.aliases || [])].map(normalizeText);
      const startsWith = terms.some((term) => term.startsWith(normalized));
      const includes = terms.some((term) => term.includes(normalized));
      if (!startsWith && !includes) return null;

      return {
        entry,
        score: startsWith ? 0 : 1,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((item) => item.entry);

  return scored;
}

export function findDidYouMean(input, recipes = []) {
  const trimmed = input.trim();
  if (trimmed.length < 2) return null;

  const registry = buildIngredientRegistry(recipes);
  if (lookupInRegistry(trimmed, registry)) return null;

  const query = normalizeText(trimmed);
  let best = null;

  registry.mergedCatalog.forEach((entry) => {
    const terms = [entry.label, entry.id, ...(entry.aliases || [])];

    terms.forEach((term) => {
      const candidate = normalizeText(term);
      if (!candidate || candidate === query) return;

      if (candidate.startsWith(query) || query.startsWith(candidate)) {
        const score = Math.abs(candidate.length - query.length);
        if (!best || score < best.score) {
          best = {
            label: entry.label,
            id: entry.id,
            source: entry.source || "catalog",
            score,
            similarity: 1,
          };
        }
        return;
      }

      const distance = levenshtein(query, candidate);
      const maxLen = Math.max(query.length, candidate.length);
      const similarity = 1 - distance / maxLen;

      if (similarity >= 0.72 && distance <= 3) {
        if (!best || similarity > best.similarity) {
          best = {
            label: entry.label,
            id: entry.id,
            source: entry.source || "catalog",
            similarity,
            score: distance,
          };
        }
      }
    });
  });

  if (!best) return null;

  return {
    label: best.label,
    id: best.id,
    source: best.source,
    similarity: best.similarity,
  };
}

export function resolveIngredient(input, recipes = []) {
  const registry = buildIngredientRegistry(recipes);
  return resolveWithRegistry(input, registry);
}

export function formatIngredientDisplay(ingredient, recipes = []) {
  if (!ingredient) return "";
  const registry = buildIngredientRegistry(recipes);
  const catalogId = lookupInRegistry(ingredient, registry);
  if (catalogId) return registry.labelMap.get(catalogId);
  return toTitleCase(ingredient);
}

export function ingredientAggregationKey(ingredient, measure, recipes = []) {
  const resolved = resolveIngredient(ingredient, recipes);
  const canonicalMeasure = normalizeMeasure(measure);
  return `${resolved.canonical}|${canonicalMeasure}`;
}

export function normalizeIngredientEntry({ quantity, measure, ingredient }, recipes = []) {
  const resolved = resolveIngredient(ingredient, recipes);
  return {
    quantity: Number(quantity),
    measure: normalizeMeasure(measure),
    ingredient: resolved.canonical,
    displayIngredient: resolved.display,
  };
}

export function extractCommunityIngredientCount(recipes = []) {
  return buildIngredientRegistry(recipes).communityEntries.length;
}
