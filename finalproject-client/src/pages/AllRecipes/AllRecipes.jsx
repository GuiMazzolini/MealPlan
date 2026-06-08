import "./AllRecipes.css";
import { useState } from "react";
import RecipeCard from "../../components/RecipeCard/RecipeCard";

function AllRecipes({ recipes }) {
  const [search, setSearch] = useState("");

  const filtered = recipes.filter((recipe) => {
    if (!recipe.type || !recipe.name) return false;
    const query = search.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(query) ||
      recipe.type.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="title-search">
        <h1 className="recipes-title">Community Recipes</h1>
        <div className="bg-sky-50">
          <h5>Browse recipes shared by the community</h5>
          <input
            placeholder="Search by name or type"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 border rounded border-gray-400 h-10 focus:outline-none pl-4 pr-8 text-gray-700 text-sm text-gray-500"
          />
        </div>
      </div>
      <div className="all-recipes-container">
        {filtered.length > 0 ? (
          filtered.map((recipe) => <RecipeCard key={recipe._id} {...recipe} />)
        ) : (
          <p>No recipes match your search.</p>
        )}
      </div>
    </>
  );
}

export default AllRecipes;
