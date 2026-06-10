import "./AddRecipe.css";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import service from "../../services/service";
import { AuthContext } from "../../context/auth.context";

function AddRecipes() {
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
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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

    service.createRecipes(requestBody)
      .then(() => navigate("/recipes"))
      .catch((error) => {
        const message = error.response?.data?.message || "Failed to create recipe. Please try again.";
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

  const handleNewIngredients = (e) => {
    const { name: field, value } = e.target;
    setNewIngredient({ ...newIngredient, [field]: value });
  };

  const addIngredients = () => {
    if (!newIngredient.ingredient.trim()) return;
    setIngredients([...ingredients, { ...newIngredient }]);
    setNewIngredient({ quantity: "", measure: "", ingredient: "" });
    setSubmitError("");
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

  return (
    <div className="add-recipe-page">
      <header className="add-recipe-header">
        <h1>Share a Recipe</h1>
        <p>Add your recipe to the community. Use the + buttons or Enter to add ingredients and steps.</p>
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
          <div className="add-recipe-ingredient-row">
            <input
              type="text"
              placeholder="Qty"
              name="quantity"
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
              <option value="milliliters">mL</option>
              <option value="units">units</option>
              <option value="grams">grams</option>
              <option value="tbs">tbs</option>
              <option value="ts">ts</option>
            </select>
            <input
              type="text"
              placeholder="Ingredient name"
              name="ingredient"
              data-action="add-ingredient"
              value={newIngredient.ingredient}
              onChange={handleNewIngredients}
            />
            <button type="button" className="add-recipe-add-btn" onClick={addIngredients}>
              +
            </button>
          </div>
          {ingredients.length > 0 ? (
            <ul className="add-recipe-list">
              {ingredients.map((item, index) => (
                <li key={`${item.ingredient}-${index}`}>
                  <span>{item.quantity} {item.measure} {item.ingredient}</span>
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
          <button type="button" className="add-recipe-cancel-btn" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="add-recipe-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sharing..." : "Share Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecipes;
