import "./ShoppingList.css";
import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import PlannerService from "../../services/plannerService";
import {
  getPlannerRecipes,
  getLatestPlanner,
  findPlannerById,
} from "../../utils/plannerHelpers";
import {
  buildShoppingItems,
  formatShoppingListText,
  formatShoppingAmounts,
} from "../../utils/shoppingListHelpers";
import { formatMeasureDisplay } from "../../constants/measures";

function ShoppingList({ recipes }) {
  const [plannerList, setPlannerList] = useState([]);
  const [activePlanner, setActivePlanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [copyFeedback, setCopyFeedback] = useState("");
  const location = useLocation();
  const { plannerId } = useParams();

  const justCreated = location.state?.justCreated;
  const justUpdated = location.state?.justUpdated;
  const planUrl = activePlanner ? `/shoppinglist/${activePlanner._id}` : "/shoppinglist";

  useEffect(() => {
    setIsLoading(true);
    setLoadError("");

    PlannerService.getPlanner()
      .then((data) => {
        setPlannerList(data);

        if (plannerId) {
          const match = findPlannerById(data, plannerId);
          if (match) {
            setActivePlanner(match);
            return;
          }
          return PlannerService.getPlannerById(plannerId)
            .then((planner) => setActivePlanner(planner))
            .catch(() => setLoadError("This meal plan could not be found."));
        }

        setActivePlanner(getLatestPlanner(data));
      })
      .catch((err) => {
        console.error("Failed to load meal plans:", err);
        setLoadError("Could not load your meal plans.");
      })
      .finally(() => setIsLoading(false));
  }, [plannerId]);

  const plannedRecipes = getPlannerRecipes(activePlanner);
  const findFullRecipe = (recipeId) => recipes.find((r) => r._id === recipeId);

  const shoppingItems = useMemo(
    () => buildShoppingItems(plannedRecipes, findFullRecipe, recipes),
    [plannedRecipes, recipes]
  );

  const shareText = useMemo(
    () =>
      formatShoppingListText(
        activePlanner?.name,
        plannedRecipes,
        shoppingItems,
        findFullRecipe
      ),
    [activePlanner, plannedRecipes, shoppingItems, recipes]
  );

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const recipeLinkState = {
    returnTo: planUrl,
    returnLabel: "← Back to meal plan",
  };

  const toggleItem = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => window.print();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyFeedback("Copied to clipboard!");
      setTimeout(() => setCopyFeedback(""), 2500);
    } catch {
      setCopyFeedback("Could not copy. Try Print instead.");
      setTimeout(() => setCopyFeedback(""), 2500);
    }
  };

  const handleShare = async () => {
    if (!canShare) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: `MealPlan — ${activePlanner?.name || "Shopping List"}`,
        text: shareText,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        handleCopy();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="shopping-page">
        <p className="shopping-loading">Loading your shopping list...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="shopping-page">
        <div className="shopping-empty">
          <h1>Meal plan not found</h1>
          <p>{loadError}</p>
          <Link to="/profile" className="shopping-btn shopping-btn--primary">
            Back to profile
          </Link>
        </div>
      </div>
    );
  }

  if (!activePlanner) {
    return (
      <div className="shopping-page">
        <div className="shopping-empty">
          <h1>No meal plan yet</h1>
          <p>Create a plan to generate your shopping list.</p>
          <Link to="/planner" className="shopping-btn shopping-btn--primary">
            Create a meal plan
          </Link>
        </div>
      </div>
    );
  }

  const planDate = activePlanner.createdAt
    ? new Date(activePlanner.createdAt).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const smsLink = `sms:?body=${encodeURIComponent(shareText)}`;

  return (
    <div className="shopping-page">
      {justCreated && (
        <div className="shopping-success-banner no-print">
          Your meal plan was created! Here&apos;s your shopping list.
        </div>
      )}
      {justUpdated && (
        <div className="shopping-success-banner no-print">
          Your meal plan was updated. Shopping list refreshed.
        </div>
      )}

      <div className="shopping-print-area">
        <header className="shopping-header">
          <div>
            <Link to="/profile" className="shopping-back-link no-print">
              ← Saved meal plans
            </Link>
            <h1>{activePlanner.name || "Meal Plan"}</h1>
            {planDate && <p className="shopping-date">{planDate}</p>}
          </div>

          <div className="shopping-actions no-print">
            <Link
              to={`/planner/${activePlanner._id}/edit`}
              className="shopping-btn"
            >
              Edit plan
            </Link>
            <button type="button" className="shopping-btn" onClick={handlePrint}>
              Print
            </button>
            <button type="button" className="shopping-btn" onClick={handleCopy}>
              Copy list
            </button>
            {canShare && (
              <button type="button" className="shopping-btn" onClick={handleShare}>
                Share
              </button>
            )}
            <a href={smsLink} className="shopping-btn shopping-btn--primary">
              Send to phone
            </a>
          </div>
        </header>

        {copyFeedback && <p className="shopping-feedback no-print">{copyFeedback}</p>}

        <div className="shopping-body">
          <section className="shopping-section">
            <h2>Meals this week</h2>
            <ul className="shopping-meals">
              {plannedRecipes.map((planned) => {
                const recipe = findFullRecipe(planned._id) || planned;
                return (
                  <li key={planned._id} className="shopping-meal-item">
                    <Link
                      to={`/recipes/${planned._id}`}
                      state={recipeLinkState}
                      className="shopping-meal-link"
                    >
                      {recipe.imageUrl && (
                        <img src={recipe.imageUrl} alt={recipe.name} />
                      )}
                      <div>
                        <span className="shopping-meal-qty">{planned.quantity}×</span>
                        <span className="shopping-meal-name">{recipe.name}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="shopping-section shopping-section--list">
            <h2>Shopping list</h2>
            {shoppingItems.length > 0 ? (
              <ul className="shopping-items">
                {shoppingItems.map((item) => {
                  const key = item.id;
                  const isChecked = !!checkedItems[key];
                  const amountsText = formatShoppingAmounts(item.amounts);
                  return (
                    <li
                      key={key}
                      className={`shopping-item${isChecked ? " shopping-item--checked" : ""}`}
                    >
                      <label className="shopping-item-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(key)}
                          className="no-print"
                        />
                        <span className="shopping-item-check print-only">☐</span>
                        <span className="shopping-item-text">
                          {item.hasMixedMeasures ? (
                            <>
                              <strong>{item.ingredient}</strong>
                              <span className="shopping-item-amounts"> — {amountsText}</span>
                            </>
                          ) : (
                            <>
                              <strong>{item.amounts[0].quantity}</strong>{" "}
                              {formatMeasureDisplay(item.amounts[0].measure)}{" "}
                              {item.ingredient}
                            </>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="shopping-hint">No ingredients found for this plan.</p>
            )}
          </section>
        </div>
      </div>

      <div className="shopping-footer no-print">
        <Link to="/planner">Create another plan</Link>
        <Link to="/profile">View all saved plans</Link>
      </div>
    </div>
  );
}

export default ShoppingList;
