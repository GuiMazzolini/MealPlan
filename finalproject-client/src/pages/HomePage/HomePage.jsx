import "./HomePage.css";
import { Link } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";

function HomePage({ recipes }) {
  const featured = recipes?.slice(-6).reverse() || [];

  return (
    <div className="home-container">
      <h1>Welcome to MealPlan</h1>
      <p className="home-subtitle">
        A community kitchen where you can share recipes, discover new meals, and plan your week.
      </p>

      {featured.length > 0 ? (
        <>
          <h2 className="home-section-title">Latest from the community</h2>
          <Carousel>
            {featured.map((recipe) => (
              <Carousel.Item className="carousel-item" key={recipe._id} interval={3000}>
                <Link className="link" to={`/recipes/${recipe._id}`}>
                  <img
                    className="d-block w-100"
                    src={recipe.imageUrl}
                    alt={recipe.name}
                  />
                  <Carousel.Caption>
                    <h3>{recipe.name}</h3>
                  </Carousel.Caption>
                </Link>
              </Carousel.Item>
            ))}
          </Carousel>
        </>
      ) : (
        <p>No recipes yet. Be the first to share one!</p>
      )}

      <Link className="home-browse-btn" to="/recipes">
        Browse all community recipes →
      </Link>
    </div>
  );
}

export default HomePage;
