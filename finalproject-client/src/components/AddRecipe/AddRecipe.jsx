import "./AddRecipe.css";
import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import service from "../../services/service";
import { AuthContext } from "../../context/auth.context";
import { MEASURE_OPTIONS, formatMeasureDisplay } from "../../constants/measures";
import {
  getIngredientCatalog,
  normalizeIngredientEntry,
  formatIngredientDisplay,
  findDidYouMean,
  extractCommunityIngredientCount,
} from "../../utils/ingredientHelpers";

function AddRecipes({ recipes = [], onRecipesChange }) {
  const { recipesId } = useParams();
  const isEditing = Boolean(recipesId);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [time, setTime] = useState("");
  const [serving, setServing] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [prepare, setPrepare] = useState([]);
  const [newStep, setNewStep] = useState("");
  const [newIngredient, setNewIngredient] = useState({
    quantity: "",
    measure: "",
    ingredient: "",
  });
  const [uploadError, setUploadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [ingredientHint, setIngredientHint] = useState("");
  const [didYouMean, setDidYouMean] = useState(null);

  const ingredientCatalog = useMemo(
    () => getIngredientCatalog(recipes),
    [recipes]
  );
  const communityIngredientCount = useMemo(
    () => extractCommunityIngredientCount(recipes),
    [recipes]
  );

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!isEditing) return;

    setIsLoading(true);
    setLoadError("");

    service.getOne(recipesId)
      .then((recipe) => {
        const ownerId = recipe.user?._id || recipe.user;
        if (ownerId !== user?._id) {
          setLoadError("You can only edit your own recipes.");
          return;
        }

        setName(recipe.name || "");
        setType(recipe.type || "");
        setImageUrl(recipe.imageUrl || "");
        setTime(recipe.time || "");
        setServing(recipe.serving != null ? String(recipe.serving) : "");
        setIngredients(recipe.ingredients || []);
        setPrepare(recipe.prepare || []);
      })
      .catch(() => setLoadError("Could not load this recipe."))
      .finally(() => setIsLoading(false));
  }, [isEditing, recipesId, user?._id]);

  const handleCancel = () => {
    if (isEditing) {
      navigate(`/recipes/${recipesId}`);
      return;
    }
    navigate(-1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError("");
    setIsUploading(true);

    const uploadData = new FormData();
    uploadData.append("imageUrl", file);
    service.uploadImage(uploadData)
      .then((response) => {
        setImageUrl(response.imageUrl);
        setUploadError("");
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Failed to upload image. Please try again.";
        setUploadError(message);
        setImageUrl("");
      })
      .finally(() => setIsUploading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?._id || isSubmitting) return;

    if (ingredients.length === 0) {
      setSubmitError("Add at least one ingredient before sharing.");
      return;
    }
    if (prepare.length === 0) {
      setSubmitError("Add at least one preparation step before sharing.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    const requestBody = {
      name,
      type,
      serving: Number(serving),
      ingredients,
      time,
      prepare,
      imageUrl,
    };

    const savePromise = isEditing
      ? service.updateRecipe(recipesId, requestBody)
      : service.createRecipes(requestBody);

    savePromise
      .then(() => {
        onRecipesChange?.();
        navigate(isEditing ? `/recipes/${recipesId}` : "/recipes");
      })
      .catch((error) => {
        const message =
          error.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} recipe. Please try again.`;
        setSubmitError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleFormKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const action = e.target.dataset?.action;

    if (action === "add-ingredient") {
      e.preventDefault();
      addIngredients();
      return;
    }

    if (action === "add-step") {
      e.preventDefault();
      addSteps();
      return;
    }

    if (e.target.type !== "submit") {
      e.preventDefault();
    }
  };

  const updateIngredientSuggestion = (value) => {
    setIngredientHint("");
    setDidYouMean(findDidYouMean(value, recipes));
  };

  const handleNewIngredients = (e) => {
    const { name: field, value } = e.target;
    setNewIngredient({ ...newIngredient, [field]: value });
    if (field === "ingredient") {
      updateIngredientSuggestion(value);
    }
  };

  const applyDidYouMean = () => {
    if (!didYouMean) return;
    setNewIngredient({ ...newIngredient, ingredient: didYouMean.label });
    setDidYouMean(null);
    setIngredientHint(`Using "${didYouMean.label}".`);
  };

  const addIngredients = () => {
    if (!newIngredient.ingredient.trim()) return;
    if (!newIngredient.measure) {
      setSubmitError("Select a unit for this ingredient.");
      return;
    }
    if (!newIngredient.quantity || Number(newIngredient.quantity) <= 0) {
      setSubmitError("Enter a valid quantity for this ingredient.");
      return;
    }

    const normalized = normalizeIngredientEntry(newIngredient, recipes);
    const wasCorrected =
      normalized.displayIngredient.toLowerCase() !==
      newIngredient.ingredient.trim().toLowerCase();

    setIngredients([
      ...ingredients,
      {
        quantity: normalized.quantity,
        measure: normalized.measure,
        ingredient: normalized.ingredient,
      },
    ]);
    setNewIngredient({ quantity: "", measure: "", ingredient: "" });
    setDidYouMean(null);
    setSubmitError("");
    setIngredientHint(
      wasCorrected ? `Saved as "${normalized.displayIngredient}".` : ""
    );
  };

  const addSteps = () => {
    if (!newStep.trim()) return;
    setPrepare([...prepare, newStep.trim()]);
    setNewStep("");
    setSubmitError("");
  };

  const deleteStep = (item) => {
    setPrepare(prepare.filter((step) => step !== item));
  };

  const deleteIngredient = (item) => {
    setIngredients(ingredients.filter((ing) => ing !== item));
  };

  if (isLoading) {
    return (
      <div className="add-recipe-page">
        <p className="add-recipe-hint" style={{ textAlign: "center", padding: "3rem" }}>
          Loading recipe...
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="add-recipe-page">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="add-recipe-error">{loadError}</p>
          <Link to="/profile" className="add-recipe-cancel-btn" style={{ display: "inline-block", marginTop: "1rem" }}>
            ← Back to profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="add-recipe-page">
      <header className="add-recipe-header">
        <h1>{isEditing ? "Edit Recipe" : "Share a Recipe"}</h1>
        <p>
          {isEditing
            ? "Update your recipe details, ingredients, or method."
            : "Add your recipe to the community. Use the + buttons or Enter to add ingredients and steps."}
        </p>
      </header>

      <form className="add-recipe-form" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
        <section className="add-recipe-section">
          <h2>Basic info</h2>
          <div className="add-recipe-grid">
            <label className="add-recipe-field add-recipe-field--full">
              <span>Recipe name</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="add-recipe-field">
              <span>Category</span>
              <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="">Select...</option>
                <option>Lunch / Dinner</option>
                <option>Desserts</option>
                <option>Breakfast</option>
                <option>Snacks</option>
              </select>
            </label>
            <label className="add-recipe-field">
              <span>Servings</span>
              <input
                type="number"
                min="1"
                value={serving}
                onChange={(e) => setServing(e.target.value)}
                required
              />
            </label>
            <label className="add-recipe-field add-recipe-field--full">
              <span>Time to prepare</span>
              <input
                type="text"
                placeholder="e.g. 1 hour, 30 minutes"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className="add-recipe-section">
          <h2>Photo</h2>
          <div className="add-recipe-photo">
            <div className="add-recipe-photo-preview">
              {imageUrl ? (
                <img src={imageUrl} alt="Recipe preview" />
              ) : (
                <span>No image yet</span>
              )}
            </div>
            <div className="add-recipe-photo-upload">
              <label className="add-recipe-file-label">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading ? "Uploading..." : "Choose image (JPG, PNG, WebP)"}
              </label>
              {uploadError && <p className="add-recipe-error">{uploadError}</p>}
              {imageUrl && !uploadError && <p className="add-recipe-success">Image uploaded.</p>}
            </div>
          </div>
        </section>

        <section className="add-recipe-section">
          <h2>Ingredients</h2>
          <p className="add-recipe-field-hint">
            Pick from suggestions when possible — names are standardized so shopping lists add up correctly.
            {communityIngredientCount > 0 && (
              <>
                {" "}
                Includes {communityIngredientCount} ingredient
                {communityIngredientCount !== 1 ? "s" : ""} from community recipes.
              </>
            )}
          </p>
          <div className="add-recipe-ingredient-row">
            <input
              type="number"
              placeholder="Qty"
              name="quantity"
              min="0"
              step="any"
              data-action="add-ingredient"
              value={newIngredient.quantity}
              onChange={handleNewIngredients}
            />
            <select
              name="measure"
              data-action="add-ingredient"
              value={newIngredient.measure}
              onChange={handleNewIngredients}
            >
              <option value="">Unit</option>
              {MEASURE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Start typing an ingredient..."
              name="ingredient"
              list="ingredient-catalog"
              data-action="add-ingredient"
              value={newIngredient.ingredient}
              onChange={handleNewIngredients}
              onBlur={() => updateIngredientSuggestion(newIngredient.ingredient)}
              autoComplete="off"
            />
            <datalist id="ingredient-catalog">
              {ingredientCatalog.map((entry) => (
                <option key={entry.id} value={entry.label} />
              ))}
            </datalist>
            <button type="button" className="add-recipe-add-btn" onClick={addIngredients}>
              +
            </button>
          </div>
          {didYouMean && (
            <p className="add-recipe-did-you-mean">
              Did you mean{" "}
              <button type="button" onClick={applyDidYouMean}>
                {didYouMean.label}
              </button>
              ?
              {didYouMean.source === "community" && (
                <span className="add-recipe-did-you-mean-note"> (from community recipes)</span>
              )}
            </p>
          )}
          {ingredientHint && (
            <p className="add-recipe-ingredient-hint">{ingredientHint}</p>
          )}
          {ingredients.length > 0 ? (
            <ul className="add-recipe-list">
              {ingredients.map((item, index) => (
                <li key={`${item.ingredient}-${item.measure}-${index}`}>
                  <span>
                    {item.quantity} {formatMeasureDisplay(item.measure)}{" "}
                    {formatIngredientDisplay(item.ingredient, recipes)}
                  </span>
                  <button type="button" className="add-recipe-remove-btn" onClick={() => deleteIngredient(item)}>×</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="add-recipe-hint">No ingredients added yet.</p>
          )}
        </section>

        <section className="add-recipe-section">
          <h2>Method</h2>
          <div className="add-recipe-step-row">
            <input
              type="text"
              placeholder="Describe one step..."
              data-action="add-step"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
            />
            <button type="button" className="add-recipe-add-btn" onClick={addSteps}>
              +
            </button>
          </div>
          {prepare.length > 0 ? (
            <ol className="add-recipe-list add-recipe-list--numbered">
              {prepare.map((step, index) => (
                <li key={`${step}-${index}`}>
                  <span className="add-recipe-step-text">
                    <strong>{index + 1}.</strong> {step}
                  </span>
                  <button type="button" className="add-recipe-remove-btn" onClick={() => deleteStep(step)}>×</button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="add-recipe-hint">No steps added yet.</p>
          )}
        </section>

        {submitError && <p className="add-recipe-error add-recipe-error--submit">{submitError}</p>}

        <div className="add-recipe-actions">
          <button type="button" className="add-recipe-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="add-recipe-submit-btn" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Sharing..."
              : isEditing
                ? "Save changes"
                : "Share Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipes;
