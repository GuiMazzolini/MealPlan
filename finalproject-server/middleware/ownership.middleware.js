const mongoose = require("mongoose");
const Recipes = require("../models/Recipes.model");
const Planner = require("../models/Planner.model");

function validateObjectId(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
    next();
  };
}

async function requireRecipeOwner(req, res, next) {
  try {
    const recipe = await Recipes.findById(req.params.recipesId);
    if (!recipe) {
      res.status(404).json({ message: "Recipe not found" });
      return;
    }
    if (recipe.user.toString() !== req.payload._id) {
      res.status(403).json({ message: "You can only modify your own recipes" });
      return;
    }
    req.recipe = recipe;
    next();
  } catch (err) {
    next(err);
  }
}

async function requirePlannerOwner(req, res, next) {
  try {
    const planner = await Planner.findById(req.params.plannerId);
    if (!planner) {
      res.status(404).json({ message: "Planner not found" });
      return;
    }
    if (!planner.user || planner.user.toString() !== req.payload._id) {
      res.status(403).json({ message: "You can only modify your own meal plans" });
      return;
    }
    req.planner = planner;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateObjectId,
  requireRecipeOwner,
  requirePlannerOwner,
};
