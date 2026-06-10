export function buildShoppingItems(plannedRecipes, findFullRecipe) {
  const aggregated = new Map();

  plannedRecipes.forEach((planned) => {
    const recipe = findFullRecipe(planned._id) || planned;

    (recipe.ingredients || []).forEach((item) => {
      const key = `${item.ingredient?.toLowerCase()}|${item.measure}`;
      const quantity = Number(item.quantity) * planned.quantity;

      if (aggregated.has(key)) {
        aggregated.get(key).quantity += quantity;
      } else {
        aggregated.set(key, {
          quantity,
          measure: item.measure,
          ingredient: item.ingredient,
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
    lines.push(`☐ ${item.quantity} ${item.measure} ${item.ingredient}`);
  });

  return lines.join("\n");
}
