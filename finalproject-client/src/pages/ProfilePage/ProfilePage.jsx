import "./ProfilePage.css";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import PlannerRecipeCard from "../../components/RecipeCard/PlannerRecipeCard";
import PlannerService from "../../services/plannerService";
import service from "../../services/service";
import { getPlannerRecipes } from "../../utils/plannerHelpers";

function ProfilePage({ recipes }) {
  const { user } = useContext(AuthContext);
  const [savedInPlanner, setSavedInPlanner] = useState([]);
  const [expandedPlannerId, setExpandedPlannerId] = useState(null);

  const loadPlanners = () => {
    PlannerService.getPlanner()
      .then((data) => setSavedInPlanner(data))
      .catch((err) => console.error("Failed to load planners:", err));
  };

  useEffect(() => {
    loadPlanners();
  }, []);

  const handleDeletePlanner = (plannerId) => {
    PlannerService.deletePlanner(plannerId)
      .then(() => loadPlanners())
      .catch((err) => console.error("Failed to delete planner:", err));
  };

  const handleDeleteRecipe = (recipeId) => {
    service.deleteRecipe(recipeId)
      .then(() => window.location.reload())
      .catch((err) => console.error("Failed to delete recipe:", err));
  };

  const userRecipes = recipes.filter((recipe) => recipe.user?._id === user?._id);

  return (
    <>
      <h1 className="welcome">Welcome {user?.name}</h1>
      <div className="profile-container">
        <div className="your-recipes-container">
          <h4>Your Recipes</h4>
          <div className="your-recipes">
            {userRecipes.length > 0 ? (
              userRecipes.map((recipe) => (
                <div className="clay clay-size" key={recipe._id}>
                  <PlannerRecipeCard {...recipe} />
                  <button
                    type="button"
                    id="img-delete"
                    className="remove-btn"
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    aria-label={`Delete ${recipe.name}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p>You haven&apos;t shared any recipes yet.</p>
            )}
          </div>
        </div>

        <div className="profile-planner-container">
          <h4>Saved Meal Plans</h4>
          {savedInPlanner.length > 0 ? (
            savedInPlanner.map((planner) => {
              const plannedRecipes = getPlannerRecipes(planner);
              const isExpanded = expandedPlannerId === planner._id;

              return (
                <div key={planner._id}>
                  <div className="profile-planner">
                    <button
                      type="button"
                      className="toggle-btn"
                      onClick={() => setExpandedPlannerId(isExpanded ? null : planner._id)}
                      aria-label="Toggle meal plan details"
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                    <p>Name: {planner.name}</p>
                    <p>Date: {planner.createdAt?.slice(0, 10).split("-").reverse().join("/")}</p>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleDeletePlanner(planner._id)}
                      aria-label="Delete meal plan"
                    >
                      ×
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="planer-meals">
                      {plannedRecipes.map((planned) => {
                        const recipe = recipes.find((r) => r._id === planned._id) || planned;
                        return (
                          <div className="meals-results" key={planned._id}>
                            <Link className="link" to={`/recipes/${planned._id}`}>
                              {planned.quantity} ×{" "}
                              <img
                                className="meal-center-result"
                                src={recipe.imageUrl}
                                width="100"
                                height="100"
                                alt={recipe.name}
                              />{" "}
                              {recipe.name}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No saved meal plans yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
