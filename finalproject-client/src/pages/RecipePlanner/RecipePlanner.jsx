import "./RecipePlanner.css";
import PlannerService from "../../services/plannerService";
import { useState, useContext, useEffect } from "react";
import PlannerRecipeCard from "../../components/RecipeCard/PlannerRecipeCard";
import { AuthContext } from "../../context/auth.context";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPlannerRecipes } from "../../utils/plannerHelpers";
import {
  loadPlannerDraft,
  savePlannerDraft,
  clearPlannerDraft,
} from "../../utils/plannerDraftStorage";

function RecipePlanner({ recipes }) {
  const { plannerId } = useParams();
  const isEditing = Boolean(plannerId);
  const draftKey = isEditing ? plannerId : null;

  const [recipesInPlanner, setRecipesInPlanner] = useState([]);
  const [plannerName, setPlannerName] = useState("");
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const plannerReturnPath = isEditing ? `/planner/${plannerId}/edit` : "/planner";

  useEffect(() => {
    const draft = loadPlannerDraft(draftKey);

    if (draft) {
      setPlannerName(draft.plannerName || "");
      setRecipesInPlanner(draft.recipesInPlanner || []);
      setSearch(draft.search || "");
    }

    if (!isEditing) {
      return;
    }

    if (draft) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError("");

    PlannerService.getPlannerById(plannerId)
      .then((planner) => {
        setPlannerName(planner.name || "");
        setRecipesInPlanner(getPlannerRecipes(planner));
      })
      .catch(() => setLoadError("Could not load this meal plan."))
      .finally(() => setIsLoading(false));
  }, [plannerId, isEditing, draftKey]);

  useEffect(() => {
    const hasDraftContent =
      plannerName.trim() || recipesInPlanner.length > 0 || search.trim();
    if (!hasDraftContent) return;

    savePlannerDraft(draftKey, { plannerName, recipesInPlanner, search });
  }, [draftKey, plannerName, recipesInPlanner, search]);

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

  const handleSave = async () => {
    if (!plannerName.trim() || recipesInPlanner.length === 0 || !user?._id) return;

    setIsSaving(true);
    try {
      if (isEditing) {
        await PlannerService.updatePlanner(plannerId, recipesInPlanner, plannerName);
        clearPlannerDraft(plannerId);
        navigate(`/shoppinglist/${plannerId}`, { state: { justUpdated: true } });
      } else {
        const created = await PlannerService.createPlanner(recipesInPlanner, plannerName);
        clearPlannerDraft(null);
        setRecipesInPlanner([]);
        setPlannerName("");
        setSearch("");
        navigate(`/shoppinglist/${created._id}`, { state: { justCreated: true } });
      }
    } catch (err) {
      console.error(`Failed to ${isEditing ? "update" : "create"} meal plan:`, err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="planner-page">
        <p className="planner-loading">Loading meal plan...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="planner-page">
        <div className="planner-error">
          <p>{loadError}</p>
          <Link to="/profile" className="planner-error-link">← Back to profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="planner-page">
      <header className="planner-page-header">
        {isEditing && (
          <Link to={`/shoppinglist/${plannerId}`} className="planner-back-link">
            ← Back to plan
          </Link>
        )}
        <h1>{isEditing ? "Edit Meal Plan" : "Create Your Meal Plan"}</h1>
        <p>
          {isEditing
            ? "Update recipes, quantities, or the plan name — then save to refresh your shopping list."
            : "Pick recipes from the community and build your weekly plan."}
        </p>
      </header>

      <div className="planner-layout">
        <aside className="planner-sidebar">
          <h2>Your plan</h2>
          <input
            type="text"
            className="planner-name-input"
            placeholder="Plan name"
            value={plannerName}
            onChange={(e) => setPlannerName(e.target.value)}
          />

          <div className="planner-selected-list">
            {recipesInPlanner.length === 0 ? (
              <p className="planner-empty-hint">No recipes added yet.</p>
            ) : (
              recipesInPlanner.map((each) => (
                <div className="planner-selected-item" key={each._id}>
                  <img src={each.imageUrl} alt={each.name} />
                  <div className="planner-selected-info">
                    <span className="planner-selected-name">{each.name}</span>
                    <span className="planner-selected-qty">× {each.quantity}</span>
                  </div>
                  <button
                    type="button"
                    className="planner-selected-remove"
                    onClick={() => deleteRecipe(each)}
                    aria-label={`Remove ${each.name}`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="planner-create-btn"
            onClick={handleSave}
            disabled={isSaving || !plannerName.trim() || recipesInPlanner.length === 0}
          >
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create plan"}
          </button>
        </aside>

        <section className="planner-browse">
          <div className="planner-browse-toolbar">
            <h2>Community recipes</h2>
            <input
              className="planner-search"
              placeholder="Search by name or type"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="planner-recipes-grid">
            {filtered.length > 0 ? (
              filtered.map((recipe) => (
                <div className="planner-recipe-picker" key={recipe._id}>
                  <PlannerRecipeCard
                    {...recipe}
                    returnTo={plannerReturnPath}
                    returnLabel="← Back to meal plan"
                  />
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => handleSelect(recipe)}
                    aria-label={`Add ${recipe.name} to meal plan`}
                  >
                    +
                  </button>
                </div>
              ))
            ) : (
              <p className="planner-no-results">No recipes match your search.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecipePlanner;
