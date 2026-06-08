const express = require("express");
const router = express.Router();
const Recipes = require("../models/Recipes.model");
const fileUploader = require("../config/cloudinary.config");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const {
  validateObjectId,
  requireRecipeOwner,
} = require("../middleware/ownership.middleware");

const ALLOWED_RECIPE_FIELDS = [
  "name",
  "type",
  "time",
  "serving",
  "ingredients",
  "prepare",
  "imageUrl",
];

function pickRecipeFields(body) {
  return ALLOWED_RECIPE_FIELDS.reduce((fields, key) => {
    if (body[key] !== undefined) {
      fields[key] = body[key];
    }
    return fields;
  }, {});
}

router.get("/recipes", (req, res, next) => {
  Recipes.find()
    .populate("user", "name")
    .then((recipesFromDB) => res.status(200).json(recipesFromDB))
    .catch((err) => next(err));
});

router.get("/recipes/:recipesId", validateObjectId("recipesId"), (req, res, next) => {
  Recipes.findById(req.params.recipesId)
    .populate("user", "name")
    .then((recipe) => {
      if (!recipe) {
        res.status(404).json({ message: "Recipe not found" });
        return;
      }
      res.status(200).json(recipe);
    })
    .catch((err) => next(err));
});

router.post(
  "/upload",
  isAuthenticated,
  fileUploader.single("imageUrl"),
  (req, res, next) => {
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }

    res.json({ imageUrl: req.file.path });
  }
);

router.post("/recipes", isAuthenticated, async (req, res, next) => {
  try {
    const recipeData = {
      ...pickRecipeFields(req.body),
      user: req.payload._id,
    };

    const newRecipe = await Recipes.create(recipeData);
    await User.findByIdAndUpdate(
      req.payload._id,
      { $push: { recipes: newRecipe._id } },
      { new: true }
    );
    res.status(201).json(newRecipe);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/recipes/:recipesId",
  isAuthenticated,
  validateObjectId("recipesId"),
  requireRecipeOwner,
  (req, res, next) => {
    Recipes.findByIdAndUpdate(req.params.recipesId, pickRecipeFields(req.body), { new: true })
      .populate("user", "name")
      .then((updatedRecipe) => res.json(updatedRecipe))
      .catch((err) => next(err));
  }
);

router.delete(
  "/recipes/:recipesId",
  isAuthenticated,
  validateObjectId("recipesId"),
  requireRecipeOwner,
  async (req, res, next) => {
    try {
      await Recipes.findByIdAndDelete(req.params.recipesId);
      await User.findByIdAndUpdate(req.payload._id, {
        $pull: { recipes: req.params.recipesId },
      });
      res.json({
        message: `Recipe with ${req.params.recipesId} is removed successfully.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
