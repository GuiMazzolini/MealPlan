export function getPlannerRecipes(planner) {
  if (!planner?.recipes?.length) return [];

  return planner.recipes.map((entry) => {
    const recipe = entry.recipe;
    if (!recipe) return null;
    return { ...recipe, quantity: entry.quantity || 1 };
  }).filter(Boolean);
}

export function getLatestPlanner(planners) {
  if (!planners?.length) return null;
  return planners[planners.length - 1];
}

export function findPlannerById(planners, plannerId) {
  if (!plannerId || !planners?.length) return null;
  return planners.find((planner) => planner._id === plannerId) || null;
}
