require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const Recipes = require("../models/Recipes.model");
const Planner = require("../models/Planner.model");

const DEMO_EMAIL = "demo@mealplan.com";
const DEMO_PASSWORD = "Demo1234";

const DEMO_RECIPES = [
  {
    name: "Creamy Tomato Pasta",
    type: "Lunch / Dinner",
    time: "25 minutes",
    serving: 4,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
    ingredients: [
      { quantity: 400, measure: "g", ingredient: "pasta" },
      { quantity: 2, measure: "tbsp", ingredient: "olive oil" },
      { quantity: 3, measure: "unit", ingredient: "garlic" },
      { quantity: 400, measure: "g", ingredient: "tomato sauce" },
      { quantity: 200, measure: "ml", ingredient: "cream" },
      { quantity: 1, measure: "tsp", ingredient: "salt" },
      { quantity: 1, measure: "tsp", ingredient: "black pepper" },
      { quantity: 30, measure: "g", ingredient: "parmesan" },
    ],
    prepare: [
      "Cook pasta in salted boiling water until al dente. Reserve a cup of pasta water, then drain.",
      "Sauté minced garlic in olive oil over medium heat for 1 minute.",
      "Stir in tomato sauce and simmer for 5 minutes.",
      "Add cream, season with salt and pepper, then toss in the pasta.",
      "Loosen with pasta water if needed and finish with parmesan.",
    ],
  },
  {
    name: "Avocado Toast with Egg",
    type: "Breakfast",
    time: "10 minutes",
    serving: 2,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80",
    ingredients: [
      { quantity: 2, measure: "unit", ingredient: "bread" },
      { quantity: 1, measure: "unit", ingredient: "avocado" },
      { quantity: 2, measure: "unit", ingredient: "egg" },
      { quantity: 1, measure: "tbsp", ingredient: "olive oil" },
      { quantity: 1, measure: "pinch", ingredient: "salt" },
      { quantity: 1, measure: "pinch", ingredient: "black pepper" },
    ],
    prepare: [
      "Toast the bread until golden.",
      "Mash avocado with salt and pepper and spread on toast.",
      "Fry eggs in olive oil to your liking.",
      "Top each toast with an egg and serve immediately.",
    ],
  },
  {
    name: "Chicken Stir Fry",
    type: "Lunch / Dinner",
    time: "30 minutes",
    serving: 3,
    imageUrl: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
    ingredients: [
      { quantity: 500, measure: "g", ingredient: "chicken breast" },
      { quantity: 2, measure: "tbsp", ingredient: "soy sauce" },
      { quantity: 1, measure: "unit", ingredient: "bell pepper" },
      { quantity: 1, measure: "unit", ingredient: "onion" },
      { quantity: 2, measure: "unit", ingredient: "garlic" },
      { quantity: 2, measure: "tbsp", ingredient: "vegetable oil" },
      { quantity: 200, measure: "g", ingredient: "rice" },
    ],
    prepare: [
      "Cook rice according to package instructions.",
      "Slice chicken and vegetables into bite-sized pieces.",
      "Stir-fry chicken in hot oil until golden, then set aside.",
      "Sauté onion, pepper, and garlic. Return chicken to the pan.",
      "Add soy sauce, toss well, and serve over rice.",
    ],
  },
  {
    name: "Chocolate Chip Cookies",
    type: "Desserts",
    time: "45 minutes",
    serving: 12,
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80",
    ingredients: [
      { quantity: 200, measure: "g", ingredient: "flour" },
      { quantity: 100, measure: "g", ingredient: "butter" },
      { quantity: 80, measure: "g", ingredient: "sugar" },
      { quantity: 60, measure: "g", ingredient: "brown sugar" },
      { quantity: 1, measure: "unit", ingredient: "egg" },
      { quantity: 1, measure: "tsp", ingredient: "vanilla extract" },
      { quantity: 1, measure: "tsp", ingredient: "baking soda" },
      { quantity: 150, measure: "g", ingredient: "chocolate" },
    ],
    prepare: [
      "Cream butter and sugars until light and fluffy.",
      "Beat in egg and vanilla.",
      "Fold in flour and baking soda, then stir in chocolate chips.",
      "Scoop onto a lined baking tray and bake at 180°C for 10–12 minutes.",
      "Cool on the tray for 5 minutes before transferring to a rack.",
    ],
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI is not set in finalproject-server/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    await Planner.deleteMany({ user: existingUser._id });
    await Recipes.deleteMany({ user: existingUser._id });
    await User.findByIdAndDelete(existingUser._id);
    console.log("Removed previous demo data.");
  }

  const hashedPassword = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const demoUser = await User.create({
    email: DEMO_EMAIL,
    password: hashedPassword,
    name: "Demo Chef",
  });

  const createdRecipes = [];
  for (const recipeData of DEMO_RECIPES) {
    const recipe = await Recipes.create({ ...recipeData, user: demoUser._id });
    createdRecipes.push(recipe);
  }

  await User.findByIdAndUpdate(demoUser._id, {
    recipes: createdRecipes.map((recipe) => recipe._id),
  });

  const demoPlan = await Planner.create({
    name: "Demo Weeknight Plan",
    user: demoUser._id,
    recipes: [
      { recipe: createdRecipes[0]._id, quantity: 2 },
      { recipe: createdRecipes[2]._id, quantity: 1 },
    ],
  });

  await User.findByIdAndUpdate(demoUser._id, {
    $push: { planner: demoPlan._id },
  });

  console.log("\nDemo data seeded successfully!\n");
  console.log("Login credentials:");
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`\nCreated ${createdRecipes.length} recipes and 1 meal plan.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
