import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/auth.context";

function navLinkClass({ isActive }) {
  return isActive ? "site-nav-link active" : "site-nav-link";
}

function NavbarComp() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="site-brand" onClick={closeMenu}>
          <span className="site-brand-icon" aria-hidden="true">🥗</span>
          MealPlan
        </NavLink>

        <button
          type="button"
          className="site-menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav${menuOpen ? " site-nav--open" : ""}`}>
          <div className="site-nav-links">
            <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/recipes" className={navLinkClass} onClick={closeMenu}>
              Recipes
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/planner" className={navLinkClass} onClick={closeMenu}>
                  Meal Plan
                </NavLink>
                <NavLink to="/addrecipes" className={navLinkClass} onClick={closeMenu}>
                  Add Recipe
                </NavLink>
              </>
            )}
          </div>

          <div className="site-nav-actions">
            {isLoggedIn ? (
              <>
                <NavLink to="/profile" className="site-user-pill" onClick={closeMenu}>
                  <span className="site-user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  {user?.name}
                </NavLink>
                <button type="button" className="site-btn site-btn--ghost" onClick={logOutUser}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="site-btn site-btn--ghost" onClick={closeMenu}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className="site-btn site-btn--primary" onClick={closeMenu}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default NavbarComp;
