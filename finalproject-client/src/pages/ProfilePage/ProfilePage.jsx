import "./ProfilePage.css";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import PlannerService from "../../services/plannerService";
import service from "../../services/service";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { getPlannerRecipes } from "../../utils/plannerHelpers";

function formatPlanDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProfilePage({ recipes, onRecipesChange }) {
  const { user } = useContext(AuthContext);
  const [savedInPlanner, setSavedInPlanner] = useState([]);
  const [expandedPlannerId, setExpandedPlannerId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const loadPlanners = () => {
    setIsLoadingPlans(true);
    PlannerService.getPlanner()
      .then((data) => setSavedInPlanner(data))
      .catch((err) => console.error("Failed to load planners:", err))
      .finally(() => setIsLoadingPlans(false));
  };

  useEffect(() => {
    loadPlanners();
  }, []);

  const requestDeleteRecipe = (recipeId, recipeName) => {
    setConfirmDialog({
      title: "Delete recipe?",
      message: `Are you sure you want to delete "${recipeName}"? This cannot be undone.`,
      confirmLabel: "Delete recipe",
      onConfirm: () => {
        service.deleteRecipe(recipeId)
          .then(() => {
            onRecipesChange?.();
            setConfirmDialog(null);
          })
          .catch((err) => console.error("Failed to delete recipe:", err));
      },
    });
  };

  const requestDeletePlanner = (plannerId, plannerName) => {
    setConfirmDialog({
      title: "Delete meal plan?",
      message: `Are you sure you want to delete "${plannerName || "this meal plan"}"? This cannot be undone.`,
      confirmLabel: "Delete plan",
      onConfirm: () => {
        PlannerService.deletePlanner(plannerId)
          .then(() => {
            loadPlanners();
            setConfirmDialog(null);
          })
          .catch((err) => console.error("Failed to delete planner:", err));
      },
    });
  };

  const userRecipes = recipes.filter((recipe) => recipe.user?._id === user?._id);

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-header-text">
          <h1>Hi, {user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-stats">
            <span>{userRecipes.length} recipe{userRecipes.length !== 1 ? "s" : ""} shared</span>
            <span className="profile-stats-dot">·</span>
            <span>{savedInPlanner.length} meal plan{savedInPlanner.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="profile-quick-actions">
          <Link to="/addrecipes" className="profile-action-btn profile-action-btn--primary">
            + Add recipe
          </Link>
          <Link to="/planner" className="profile-action-btn">
            Create meal plan
          </Link>
        </div>
      </header>

      <div className="profile-grid">
        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Your recipes</h2>
          </div>

          {userRecipes.length > 0 ? (
            <div className="profile-recipes-grid">
              {userRecipes.map((recipe) => (
                <div className="profile-recipe-card" key={recipe._id}>
                  <Link to={`/recipes/${recipe._id}`} className="profile-recipe-link">
                    <div className="profile-recipe-image-wrap">
                      {recipe.imageUrl ? (
                        <img src={recipe.imageUrl} alt={recipe.name} />
                      ) : (
                        <div className="profile-recipe-placeholder">No image</div>
                      )}
                    </div>
                    <h3>{recipe.name}</h3>
                    <span className="profile-recipe-type">{recipe.type}</span>
                  </Link>
                  <button
                    type="button"
                    className="profile-recipe-delete"
                    onClick={() => requestDeleteRecipe(recipe._id, recipe.name)}
                    aria-label={`Delete ${recipe.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <p>You haven&apos;t shared any recipes yet.</p>
              <Link to="/addrecipes" className="profile-action-btn profile-action-btn--primary">
                Share your first recipe
              </Link>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Saved meal plans</h2>
          </div>

          {isLoadingPlans ? (
            <p className="profile-loading">Loading meal plans...</p>
          ) : savedInPlanner.length > 0 ? (
            <div className="profile-plans-list">
              {savedInPlanner.map((planner) => {
                const plannedRecipes = getPlannerRecipes(planner);
                const isExpanded = expandedPlannerId === planner._id;

                return (
                  <div className="profile-plan-card" key={planner._id}>
                    <div className="profile-plan-header">
                      <button
                        type="button"
                        className="profile-plan-toggle"
                        onClick={() =>
                          setExpandedPlannerId(isExpanded ? null : planner._id)
                        }
                        aria-expanded={isExpanded}
                      >
                        <span className="profile-plan-chevron">{isExpanded ? "▼" : "▶"}</span>
                        <div className="profile-plan-info">
                          <span className="profile-plan-name">{planner.name || "Untitled plan"}</span>
                          <span className="profile-plan-meta">
                            {formatPlanDate(planner.createdAt)}
                            {" · "}
                            {plannedRecipes.length} recipe{plannedRecipes.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </button>
                      <Link
                        to={`/shoppinglist/${planner._id}`}
                        className="profile-plan-action-link"
                      >
                        Open
                      </Link>
                      <Link
                        to={`/planner/${planner._id}/edit`}
                        className="profile-plan-action-link"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="profile-plan-delete"
                        onClick={() => requestDeletePlanner(planner._id, planner.name)}
                        aria-label="Delete meal plan"
                      >
                        ×
                      </button>
                    </div>

                    {isExpanded && (
                        <ul className="profile-plan-meals">
                          {plannedRecipes.map((planned) => {
                            const recipe =
                              recipes.find((r) => r._id === planned._id) || planned;
                            return (
                              <li key={planned._id}>
                                <Link
                                  to={`/recipes/${planned._id}`}
                                  state={{
                                    returnTo: `/shoppinglist/${planner._id}`,
                                    returnLabel: "← Back to meal plan",
                                  }}
                                >
                                  {recipe.imageUrl && (
                                    <img src={recipe.imageUrl} alt={recipe.name} />
                                  )}
                                  <span>
                                    <strong>{planned.quantity}×</strong> {recipe.name}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="profile-empty">
              <p>No saved meal plans yet.</p>
              <Link to="/planner" className="profile-action-btn profile-action-btn--primary">
                Create a meal plan
              </Link>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}

export default ProfilePage;
