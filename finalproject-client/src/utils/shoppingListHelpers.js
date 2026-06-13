import { normalizeMeasure, formatMeasureDisplay } from "../constants/measures";
import {
  formatIngredientDisplay,
  ingredientAggregationKey,
  resolveIngredient,
} from "./ingredientHelpers";

export function buildShoppingItems(plannedRecipes, findFullRecipe, recipes = []) {
  const aggregated = new Map();

  plannedRecipes.forEach((planned) => {
    const recipe = findFullRecipe(planned._id) || planned;

    (recipe.ingredients || []).forEach((item) => {
      const key = ingredientAggregationKey(item.ingredient, item.measure, recipes);
      const quantity = Number(item.quantity) * planned.quantity;
      const canonicalMeasure = normalizeMeasure(item.measure);
      const displayIngredient = formatIngredientDisplay(item.ingredient, recipes);

      if (aggregated.has(key)) {
        aggregated.get(key).quantity += quantity;
      } else {
        aggregated.set(key, {
          quantity,
          measure: canonicalMeasure,
          ingredient: displayIngredient,
        });
      }
    });
  });

  return Array.from(aggregated.values()).sort((a, b) =>
    a.ingredient.localeCompare(b.ingredient)
  );
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
    const measureLabel = formatMeasureDisplay(item.measure);
    lines.push(`☐ ${item.quantity} ${measureLabel} ${item.ingredient}`);
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
