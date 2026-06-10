import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">
            <span aria-hidden="true">🥗</span> MealPlan
          </Link>
          <p>Share recipes, plan meals, and shop smarter — together.</p>
        </div>

        <div className="site-footer-links">
          <div className="site-footer-col">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/recipes">Community Recipes</Link>
            <Link to="/planner">Meal Plan</Link>
          </div>
          <div className="site-footer-col">
            <h3>Account</h3>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <p>© {year} MealPlan. Built with React &amp; Node.</p>
      </div>
    </footer>
  );
}

export default Footer;
