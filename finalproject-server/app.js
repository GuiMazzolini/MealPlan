require("dotenv").config();
require("./db");
const express = require("express");
const app = express();

require("./config")(app);

const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const recipesRoutes = require("./routes/recipes.routes");
app.use("/", recipesRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const plannerRoutes = require("./routes/planner.routes");
app.use("/", plannerRoutes);

require("./error-handling")(app);

module.exports = app;
