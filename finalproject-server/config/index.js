const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

module.exports = (app) => {
  app.set("trust proxy", 1);

  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

  app.use(
    cors({
      origin: allowedOrigin,
      methods: ["GET", "PUT", "POST", "DELETE"],
      credentials: true,
    })
  );
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
};
