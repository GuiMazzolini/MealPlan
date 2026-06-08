import "./RecipeCard.css";
import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";

function RecipeCard({ type, name, _id, serving, time, imageUrl, user }) {
  return (
    <Link className="link" to={`/recipes/${_id}`}>
      <div className="clay">
        <img src={imageUrl} alt={name} className="recipe-img" />
        <Card.Body>
          <Card.Title className="card-name">{name}</Card.Title>
          <Card.Text className="recipe-topics">
            <div className="topic">
              <p>Type:</p>
              <p>Time:</p>
              <p>Servings:</p>
            </div>
            <div className="recipe-result">
              <p>{type}</p>
              <p>{time}</p>
              <p>{serving}</p>
            </div>
          </Card.Text>
        </Card.Body>
        {user?.name && (
          <Card.Footer>
            <p><small className="text-muted">Shared by {user.name}</small></p>
          </Card.Footer>
        )}
      </div>
    </Link>
  );
}

export default RecipeCard;
