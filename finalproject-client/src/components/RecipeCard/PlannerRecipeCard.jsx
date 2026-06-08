import "./RecipeCard.css";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";

function PlannerRecipeCard({ name, _id, imageUrl }) {
  return (
    <Link className="link" to={`/recipes/${_id}`}>
      <img src={imageUrl} alt={name} className="recipe-img" />
      <Card.Title className="card-name">{name}</Card.Title>
    </Link>
  );
}

export default PlannerRecipeCard;
