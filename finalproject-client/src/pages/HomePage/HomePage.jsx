import "./HomePage.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";
import RecipeCard from "../../components/RecipeCard/RecipeCard";

const FEATURES = [
  {
    title: "Share recipes",
    text: "Post your favourite dishes with photos, ingredients, and step-by-step instructions.",
    icon: "🍳",
  },
  {
    title: "Plan your week",
    text: "Pick recipes for each day and build a meal plan in a few clicks.",
    icon: "📅",
  },
  {
    title: "Shop smarter",
    text: "Turn any plan into a combined shopping list you can print or share.",
    icon: "🛒",
  },
];

function HomePage({ recipes }) {
  const { isLoggedIn } = useContext(AuthContext);
  const featured = recipes?.slice(-3).reverse() || [];

  return (
    <>
      <section className="home-hero-band" aria-label="Welcome">
        <div className="home-hero">
          <h1>Welcome to MealPlan</h1>
          <p className="home-subtitle">
            A community kitchen where you can share recipes, discover new meals, and plan your week.
          </p>
          <div className="home-hero-actions">
            <Link className="home-btn home-btn--primary" to="/recipes">
              Browse recipes
            </Link>
            {isLoggedIn ? (
              <Link className="home-btn home-btn--secondary" to="/planner">
                Meal planner
              </Link>
            ) : (
              <Link className="home-btn home-btn--secondary" to="/signup">
                Join free
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="home-page">
      <section className="home-features" aria-label="What you can do">
        {FEATURES.map((feature) => (
          <article className="home-feature" key={feature.title}>
            <span className="home-feature-icon" aria-hidden="true">
              {feature.icon}
            </span>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      {featured.length > 0 && (
        <section className="home-latest">
          <h2 className="home-section-title">Latest from the community</h2>
          <div className="home-recipe-grid">
            {featured.map((recipe) => (
              <RecipeCard key={recipe._id} {...recipe} compact />
            ))}
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <p className="home-empty">No recipes yet — be the first to share one!</p>
      )}
      </div>
    </>
  );
}

export default HomePage;
