import api from "./api";

const getPlanner = () => {
  return api.get("/planner").then((res) => res.data);
};

const getPlannerById = (id) => {
  return api.get(`/planner/${id}`).then((res) => res.data);
};

const buildPlannerPayload = (recipes, name) => ({
  name,
  recipes: recipes.map(({ _id, quantity }) => ({
    recipe: _id,
    quantity: quantity || 1,
  })),
});

const createPlanner = (recipes, name) => {
  return api.post("/planner", buildPlannerPayload(recipes, name)).then((res) => res.data);
};

const updatePlanner = (id, recipes, name) => {
  return api.put(`/planner/${id}`, buildPlannerPayload(recipes, name)).then((res) => res.data);
};

const deletePlanner = (id) => {
  return api.delete(`/planner/${id}`).then((res) => res.data);
};

const plannerService = {
  getPlanner,
  getPlannerById,
  createPlanner,
  updatePlanner,
  deletePlanner,
};

export default plannerService;
