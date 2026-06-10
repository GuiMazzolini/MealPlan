import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import service from "./services/service";
import HomePage from "./pages/HomePage/HomePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SignupPage from "./pages/SignupPage/SignupPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import AllRecipes from "./pages/AllRecipes/AllRecipes";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import IsPrivate from "./components/IsPrivate/IsPrivate";
import IsAnon from "./components/IsAnon/IsAnon";
import AddRecipes from "./components/AddRecipe/AddRecipe";
import RecipesDetails from "./pages/RecipesDetails/RecipesDetails";
import RecipePlanner from "./pages/RecipePlanner/RecipePlanner";
import ShoppingList from "./pages/ShoppingList/ShoppingList";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [recipes, setRecipes] = useState([]);

  const loadRecipes = () => {
    service.getRecipes()
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Failed to load recipes:", err));
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage recipes={recipes} />} />
          <Route path="/recipes" element={<AllRecipes recipes={recipes} />} />
          <Route path="/recipes/:recipesId" element={<RecipesDetails />} />
          <Route
            path="/profile"
            element={
              <IsPrivate>
                <ProfilePage recipes={recipes} onRecipesChange={loadRecipes} />
              </IsPrivate>
            }
          />
          <Route
            path="/addrecipes"
            element={
              <IsPrivate>
                <AddRecipes />
              </IsPrivate>
            }
          />
          <Route
            path="/planner/:plannerId/edit"
            element={
              <IsPrivate>
                <RecipePlanner recipes={recipes} />
              </IsPrivate>
            }
          />
          <Route
            path="/planner"
            element={
              <IsPrivate>
                <RecipePlanner recipes={recipes} />
              </IsPrivate>
            }
          />
          <Route
            path="/shoppinglist/:plannerId?"
            element={
              <IsPrivate>
                <ShoppingList recipes={recipes} />
              </IsPrivate>
            }
          />
          <Route
            path="/signup"
            element={
              <IsAnon>
                <SignupPage />
              </IsAnon>
            }
          />
          <Route
            path="/login"
            element={
              <IsAnon>
                <LoginPage />
              </IsAnon>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
