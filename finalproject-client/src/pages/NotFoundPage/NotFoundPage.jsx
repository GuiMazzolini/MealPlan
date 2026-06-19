import "./NotFoundPage.css";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <span className="not-found-code" aria-hidden="true">
        404
      </span>
      <h1>Page not found</h1>
      <p>
        This page doesn&apos;t exist or may have been moved. Head back home or browse community recipes.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="not-found-btn not-found-btn--primary">
          Go home
        </Link>
        <Link to="/recipes" className="not-found-btn not-found-btn--secondary">
          Browse recipes
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
