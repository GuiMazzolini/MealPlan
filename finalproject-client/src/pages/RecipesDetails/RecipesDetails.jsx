import "./RecipesDetails.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import service from "../../services/service";

function RecipesDetails() {
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const { recipesId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    service.getOne(recipesId)
      .then((data) => setCurrentRecipe(data))
      .catch((err) => console.error("Failed to load recipe:", err));
  }, [recipesId]);

  if (!currentRecipe) {
    return <p>Loading recipe...</p>;
  }

  return (
    <div className="details-container">
      <h1>
        <button
          type="button"
          className="return-icon"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>
        {currentRecipe.name}
      </h1>
      <div className="details-columns">
        <div className="details-column">
          <img className="recipe-avatar" src={currentRecipe.imageUrl} alt={currentRecipe.name} />
          <p>Serves {currentRecipe.serving} people</p>
          <p>Category: {currentRecipe.type}</p>
          <p>Time: {currentRecipe.time}</p>
        </div>
        <div className="ingredients-column">
          <p>Ingredients:</p>
          <ul>
            {currentRecipe.ingredients.map((item, index) => (
              <li key={`${item.ingredient}-${index}`}>
                {item.quantity} {item.measure} {item.ingredient}
              </li>
            ))}
          </ul>
        </div>
        <div className="method-column">
          <p>Method:</p>
          <ol>
            {currentRecipe.prepare.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default RecipesDetails;
