import api from "./api";

const getPlanner = () => {
  return api.get("/planner").then((res) => res.data);
};

const createPlanner = (recipes, name) => {
  const payload = {
    name,
    recipes: recipes.map(({ _id, quantity }) => ({
      recipe: _id,
      quantity: quantity || 1,
    })),
  };
  return api.post("/planner", payload).then((res) => res.data);
};

const deletePlanner = (id) => {
  return api.delete(`/planner/${id}`).then((res) => res.data);
};

const plannerService = {
  getPlanner,
  createPlanner,
  deletePlanner,
};

export default plannerService;
