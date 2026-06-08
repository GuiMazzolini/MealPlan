const { UnauthorizedError } = require("express-jwt");

module.exports = (app) => {
  app.use((req, res) => {
    res.status(404).json({ message: "This route does not exist" });
  });

  app.use((err, req, res, next) => {
    console.error("ERROR", req.method, req.path, err);

    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof UnauthorizedError) {
      res.status(401).json({ message: "Invalid or missing authentication token" });
      return;
    }

    if (err.name === "ValidationError") {
      res.status(400).json({ message: err.message });
      return;
    }

    if (err.code === 11000) {
      res.status(400).json({ message: "A record with that value already exists" });
      return;
    }

    res.status(500).json({
      message: "Internal server error. Check the server console",
    });
  });
};
