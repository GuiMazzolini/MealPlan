import "./RecipeCard.css";
import { Link } from "react-router-dom";

function PlannerRecipeCard({ name, _id, imageUrl, returnTo, returnLabel }) {
  return (
    <Link
      className="planner-recipe-card"
      to={`/recipes/${_id}`}
      state={
        returnTo
          ? { returnTo, returnLabel: returnLabel || "← Back to meal plan" }
          : undefined
      }
    >
      <div className="recipe-card-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="recipe-card-image" loading="lazy" />
        ) : (
          <div className="recipe-card-image recipe-card-image--placeholder">No image</div>
        )}
      </div>
      <h3 className="recipe-card-title">{name}</h3>
    </Link>
  );
}

export default PlannerRecipeCard;
