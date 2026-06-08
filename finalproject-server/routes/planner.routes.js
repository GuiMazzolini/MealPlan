const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Planner = require("../models/Planner.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const {
  validateObjectId,
  requirePlannerOwner,
} = require("../middleware/ownership.middleware");

const plannerPopulate = [
  { path: "user", select: "name" },
  {
    path: "recipes.recipe",
    select: "name imageUrl ingredients type time serving",
  },
];

router.get("/planner", isAuthenticated, (req, res, next) => {
  Planner.find({ user: req.payload._id })
    .populate(plannerPopulate)
    .then((plannerFromDB) => res.status(200).json(plannerFromDB))
    .catch((err) => next(err));
});

router.get(
  "/planner/:plannerId",
  isAuthenticated,
  validateObjectId("plannerId"),
  requirePlannerOwner,
  (req, res, next) => {
    Planner.findById(req.params.plannerId)
      .populate(plannerPopulate)
      .then((planner) => res.status(200).json(planner))
      .catch((err) => next(err));
  }
);

router.post("/planner", isAuthenticated, async (req, res, next) => {
  try {
    const plannerData = {
      name: req.body.name,
      recipes: req.body.recipes,
      user: req.payload._id,
    };

    const newPlanner = await Planner.create(plannerData);
    await User.findByIdAndUpdate(
      req.payload._id,
      { $push: { planner: newPlanner._id } },
      { new: true }
    );
    res.status(201).json(newPlanner);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/planner/:plannerId",
  isAuthenticated,
  validateObjectId("plannerId"),
  requirePlannerOwner,
  (req, res, next) => {
    const updates = {
      name: req.body.name,
      recipes: req.body.recipes,
    };

    Planner.findByIdAndUpdate(req.params.plannerId, updates, { new: true })
      .populate(plannerPopulate)
      .then((updatedPlanner) => res.json(updatedPlanner))
      .catch((err) => next(err));
  }
);

router.delete(
  "/planner/:plannerId",
  isAuthenticated,
  validateObjectId("plannerId"),
  requirePlannerOwner,
  async (req, res, next) => {
    try {
      await Planner.findByIdAndDelete(req.params.plannerId);
      await User.findByIdAndUpdate(req.payload._id, {
        $pull: { planner: req.params.plannerId },
      });
      res.json({
        message: `Planner with ${req.params.plannerId} is removed successfully.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
