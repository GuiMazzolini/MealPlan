import "./RecipePlanner.css";
import PlannerService from "../../services/plannerService";
import { useState, useContext } from "react";
import PlannerRecipeCard from "../../components/RecipeCard/PlannerRecipeCard";
import { AuthContext } from "../../context/auth.context";
import { useNavigate } from "react-router-dom";

function RecipePlanner({ recipes }) {
  const [recipesInPlanner, setRecipesInPlanner] = useState([]);
  const [plannerName, setPlannerName] = useState("");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const filtered = recipes.filter((recipe) => {
    if (!recipe.type || !recipe.name) return false;
    const query = search.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(query) ||
      recipe.type.toLowerCase().includes(query)
    );
  });

  const handleSelect = (recipe) => {
    const existingIndex = recipesInPlanner.findIndex((r) => r._id === recipe._id);

    if (existingIndex < 0) {
      setRecipesInPlanner([{ ...recipe, quantity: 1 }, ...recipesInPlanner]);
      return;
    }

    const updated = [...recipesInPlanner];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + 1,
    };
    setRecipesInPlanner(updated);
  };

  const deleteRecipe = (item) => {
    setRecipesInPlanner(recipesInPlanner.filter((r) => r._id !== item._id));
  };

  const handleClick = async () => {
    if (!plannerName.trim() || recipesInPlanner.length === 0 || !user?._id) return;

    setIsSaving(true);
    try {
      await PlannerService.createPlanner(recipesInPlanner, plannerName);
      setRecipesInPlanner([]);
      setPlannerName("");
      navigate("/shoppinglist");
    } catch (err) {
      console.error("Failed to create meal plan:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="title-search">
        <h1 className="recipes-title">Create Your Meal Plan</h1>
        <div className="bg-sky-50">
          <h5>Pick recipes from the community to build your plan</h5>
          <input
            placeholder="Search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 border rounded border-gray-400 h-10 focus:outline-none pl-4 pr-8 text-gray-700 text-sm text-gray-500"
          />
        </div>
      </div>
      <div className="total-container">
        <div className="meals-container">
          {filtered.map((recipe) => (
            <div className="clay clay-size" key={recipe._id}>
              <PlannerRecipeCard {...recipe} />
              <button
                type="button"
                className="add-btn"
                onClick={() => handleSelect(recipe)}
                aria-label={`Add ${recipe.name} to meal plan`}
              >
                +
              </button>
            </div>
          ))}
        </div>
        <div className="meal-results-container">
          <input
            type="text"
            className="inpt-meal-name"
            placeholder="Plan name"
            value={plannerName}
            onChange={(e) => setPlannerName(e.target.value)}
          />
          {recipesInPlanner.map((each) => (
            <div className="meal-total" key={each._id}>
              <img src={each.imageUrl} width="80" height="80" alt={each.name} />
              <p>{each.name}</p>
              <p>{each.quantity}</p>
              <button
                type="button"
                className="remove-btn"
                onClick={() => deleteRecipe(each)}
                aria-label={`Remove ${each.name}`}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="create-mealplan-btn"
            onClick={handleClick}
            disabled={isSaving || !plannerName.trim() || recipesInPlanner.length === 0}
          >
            {isSaving ? "Saving..." : "Create Shopping List"}
          </button>
        </div>
      </div>
    </>
  );
}

export default RecipePlanner;
