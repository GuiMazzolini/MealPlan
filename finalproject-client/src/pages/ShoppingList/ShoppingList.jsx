import "./ShoppingList.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PlannerService from "../../services/plannerService";
import { getPlannerRecipes, getLatestPlanner } from "../../utils/plannerHelpers";

function ShoppingList({ recipes }) {
  const [plannerList, setPlannerList] = useState([]);

  useEffect(() => {
    PlannerService.getPlanner()
      .then((data) => setPlannerList(data))
      .catch((err) => console.error("Failed to load meal plans:", err));
  }, []);

  const latestPlanner = getLatestPlanner(plannerList);
  const plannedRecipes = getPlannerRecipes(latestPlanner);

  const findFullRecipe = (recipeId) => recipes.find((r) => r._id === recipeId);

  if (!latestPlanner) {
    return (
      <div className="container-shopping-meal">
        <p>No meal plan yet. <Link to="/planner">Create one</Link> to generate a shopping list.</p>
      </div>
    );
  }

  return (
    <div className="container-shopping-meal">
      <div className="meals-list">
        <h1>{latestPlanner.name || "Meal Plan"}</h1>
        {plannedRecipes.map((planned) => {
          const recipe = findFullRecipe(planned._id) || planned;
          return (
            <p key={planned._id}>
              {planned.quantity} ×{" "}
              <img
                className="meal-center-result"
                src={recipe.imageUrl}
                width="100"
                height="100"
                alt={recipe.name}
              />{" "}
              {recipe.name}
            </p>
          );
        })}
      </div>

      <div className="shopping-list">
        <h1>Shopping List</h1>
        <ul>
          {plannedRecipes.flatMap((planned) => {
            const recipe = findFullRecipe(planned._id) || planned;
            return (recipe.ingredients || []).map((item, index) => (
              <li key={`${planned._id}-${item.ingredient}-${index}`}>
                <input id={`checkbox-${planned._id}-${index}`} type="checkbox" />
                {item.quantity * planned.quantity} {item.measure} of {item.ingredient}
              </li>
            ));
          })}
        </ul>
      </div>
    </div>
  );
}

export default ShoppingList;
