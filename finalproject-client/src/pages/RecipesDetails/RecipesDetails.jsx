import "./RecipesDetails.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import service from "../../services/service";
import { formatRecipeIngredient } from "../../utils/shoppingListHelpers";

function RecipesDetails({ recipes = [] }) {
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [loadError, setLoadError] = useState("");
  const { recipesId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;
  const returnLabel = location.state?.returnLabel || "← Back";

  useEffect(() => {
    setLoadError("");
    setCurrentRecipe(null);

    service.getOne(recipesId)
      .then((data) => setCurrentRecipe(data))
      .catch(() => setLoadError("Could not load this recipe. It may have been removed."));
  }, [recipesId]);

  if (loadError) {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-error">
          <p>{loadError}</p>
          <Link to="/recipes" className="recipe-detail-back-link">← Back to recipes</Link>
        </div>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="recipe-detail-page">
        <p className="recipe-detail-loading">Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      {returnTo ? (
        <Link to={returnTo} className="recipe-detail-back">
          {returnLabel}
        </Link>
      ) : (
        <button
          type="button"
          className="recipe-detail-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      )}

      <header className="recipe-detail-hero">
        <div className="recipe-detail-image-wrap">
          {currentRecipe.imageUrl ? (
            <img
              className="recipe-detail-image"
              src={currentRecipe.imageUrl}
              alt={currentRecipe.name}
            />
          ) : (
            <div className="recipe-detail-image recipe-detail-image--placeholder">No image</div>
          )}
          {currentRecipe.type && (
            <span className="recipe-detail-badge">{currentRecipe.type}</span>
          )}
        </div>

        <div className="recipe-detail-hero-content">
          <h1>{currentRecipe.name}</h1>

          <div className="recipe-detail-meta">
            {currentRecipe.time && (
              <span className="recipe-detail-meta-item">
                <span aria-hidden="true">⏱</span> {currentRecipe.time}
              </span>
            )}
            {currentRecipe.serving != null && (
              <span className="recipe-detail-meta-item">
                <span aria-hidden="true">🍽</span> Serves {currentRecipe.serving}
              </span>
            )}
          </div>

          {currentRecipe.user?.name && (
            <p className="recipe-detail-author">
              Shared by <strong>{currentRecipe.user.name}</strong>
            </p>
          )}
        </div>
      </header>

      <div className="recipe-detail-body">
        <section className="recipe-detail-section">
          <h2>Ingredients</h2>
          <ul className="recipe-detail-ingredients">
            {currentRecipe.ingredients.map((item, index) => {
              const formatted = formatRecipeIngredient(item, recipes);
              return (
              <li key={`${item.ingredient}-${index}`}>
                <span className="recipe-detail-ingredient-qty">
                  {formatted.quantity} {formatted.measure}
                </span>
                <span className="recipe-detail-ingredient-name">{formatted.ingredient}</span>
              </li>
            );
            })}
          </ul>
        </section>

        <section className="recipe-detail-section recipe-detail-section--method">
          <h2>Method</h2>
          <ol className="recipe-detail-steps">
            {currentRecipe.prepare.map((step, index) => (
              <li key={`${step}-${index}`}>
                <span className="recipe-detail-step-num">{index + 1}</span>
                <span className="recipe-detail-step-text">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default RecipesDetails;
