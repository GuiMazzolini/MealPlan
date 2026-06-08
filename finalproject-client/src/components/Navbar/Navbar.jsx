import "./Navbar.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/auth.context";

function navLinkClass({ isActive }) {
  return isActive ? "nav-link navbar-link active" : "nav-link navbar-link";
}

function NavbarComp() {
  const { isLoggedIn, user, logOutUser } = useContext(AuthContext);

  return (
    <Navbar className="navbar" collapseOnSelect expand="lg" variant="dark">
      <Container>
        <Navbar.Brand as={NavLink} to="/">MealPlan</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end className={navLinkClass}>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/recipes" className={navLinkClass}>
              Community Recipes
            </Nav.Link>
            {isLoggedIn && (
              <>
                <Nav.Link as={NavLink} to="/planner" className={navLinkClass}>
                  Meal Plan
                </Nav.Link>
                <Nav.Link as={NavLink} to="/addrecipes" className={navLinkClass}>
                  Add Recipe
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isLoggedIn && (
              <>
                <Nav.Link className="navbar-link" onClick={logOutUser}>
                  Logout
                </Nav.Link>
                <Nav.Link as={NavLink} to="/profile" className={navLinkClass}>
                  Profile
                </Nav.Link>
                <p className="welcome-msg">Hello {user?.name}</p>
              </>
            )}
            {!isLoggedIn && (
              <>
                <Nav.Link as={NavLink} to="/signup" className={navLinkClass}>
                  Sign Up
                </Nav.Link>
                <Nav.Link as={NavLink} to="/login" className={navLinkClass}>
                  Log in
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComp;
