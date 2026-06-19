import { normalizeMeasure, formatMeasureDisplay } from "../constants/measures";
import {
  formatIngredientDisplay,
  ingredientAggregationKey,
  resolveIngredient,
} from "./ingredientHelpers";

function mergeAmounts(amounts, quantity, measure) {
  const existing = amounts.find((entry) => entry.measure === measure);
  if (existing) {
    existing.quantity += quantity;
  } else {
    amounts.push({ quantity, measure });
  }
}

export function formatShoppingAmounts(amounts) {
  return amounts
    .map(({ quantity, measure }) => `${quantity} ${formatMeasureDisplay(measure)}`)
    .join(", ");
}

export function buildShoppingItems(plannedRecipes, findFullRecipe, recipes = []) {
  const byIngredientAndMeasure = new Map();

  plannedRecipes.forEach((planned) => {
    const recipe = findFullRecipe(planned._id) || planned;

    (recipe.ingredients || []).forEach((item) => {
      const key = ingredientAggregationKey(item.ingredient, item.measure, recipes);
      const quantity = Number(item.quantity) * planned.quantity;
      const canonicalMeasure = normalizeMeasure(item.measure);
      const resolved = resolveIngredient(item.ingredient, recipes);

      if (byIngredientAndMeasure.has(key)) {
        byIngredientAndMeasure.get(key).quantity += quantity;
      } else {
        byIngredientAndMeasure.set(key, {
          quantity,
          measure: canonicalMeasure,
          ingredient: resolved.display,
          canonical: resolved.canonical,
        });
      }
    });
  });

  const grouped = new Map();

  byIngredientAndMeasure.forEach((entry) => {
    if (!grouped.has(entry.canonical)) {
      grouped.set(entry.canonical, {
        id: entry.canonical,
        ingredient: entry.ingredient,
        amounts: [],
      });
    }

    mergeAmounts(
      grouped.get(entry.canonical).amounts,
      entry.quantity,
      entry.measure
    );
  });

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      hasMixedMeasures: item.amounts.length > 1,
    }))
    .sort((a, b) => a.ingredient.localeCompare(b.ingredient));
}

export function formatShoppingListText(planName, plannedRecipes, shoppingItems, findFullRecipe) {
  const lines = [`MealPlan — ${planName || "Shopping List"}`, ""];

  if (plannedRecipes.length > 0) {
    lines.push("Meals:");
    plannedRecipes.forEach((planned) => {
      const recipe = findFullRecipe(planned._id) || planned;
      lines.push(`• ${planned.quantity}× ${recipe.name}`);
    });
    lines.push("");
  }

  lines.push("Shopping list:");
  shoppingItems.forEach((item) => {
    const amounts = formatShoppingAmounts(item.amounts);
    if (item.hasMixedMeasures) {
      lines.push(`☐ ${item.ingredient} — ${amounts}`);
    } else {
      lines.push(`☐ ${amounts} ${item.ingredient}`);
    }
  });

  return lines.join("\n");
}

export function formatRecipeIngredient(item, recipes = []) {
  const resolved = resolveIngredient(item.ingredient, recipes);
  return {
    quantity: item.quantity,
    measure: formatMeasureDisplay(item.measure),
    ingredient: resolved.display,
  };
}
