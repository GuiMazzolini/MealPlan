import "./RecipeCard.css";
import { Link } from "react-router-dom";

function RecipeCard({ type, name, _id, serving, time, imageUrl, user, compact = false }) {
  return (
    <Link
      className={`recipe-card-link${compact ? " recipe-card-link--compact" : ""}`}
      to={`/recipes/${_id}`}
    >
      <article className={`recipe-card${compact ? " recipe-card--compact" : ""}`}>
        <div className="recipe-card-image-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="recipe-card-image" loading="lazy" />
          ) : (
            <div className="recipe-card-image recipe-card-image--placeholder">No image</div>
          )}
          {type && <span className="recipe-card-badge">{type}</span>}
        </div>

        <div className="recipe-card-body">
          <h3 className="recipe-card-title">{name}</h3>

          <div className="recipe-card-meta">
            {time && (
              <span className="recipe-card-meta-item">
                <span className="recipe-card-meta-icon" aria-hidden="true">⏱</span>
                {time}
              </span>
            )}
            {serving != null && serving !== "" && (
              <span className="recipe-card-meta-item">
                <span className="recipe-card-meta-icon" aria-hidden="true">🍽</span>
                Serves {serving}
              </span>
            )}
          </div>

          {user?.name && (
            <p className="recipe-card-author">
              Shared by <strong>{user.name}</strong>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

export default RecipeCard;
