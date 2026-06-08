import api from "./api";

const errorHandler = (err) => {
  throw err;
};

const getOne = (id) => {
  return api.get(`/recipes/${id}`).then((res) => res.data).catch(errorHandler);
};

const getRecipes = () => {
  return api.get("/recipes").then((res) => res.data).catch(errorHandler);
};

const uploadImage = (file) => {
  return api.post("/upload", file).then((res) => res.data).catch(errorHandler);
};

const createRecipes = (newRecipe) => {
  return api.post("/recipes", newRecipe).then((res) => res.data).catch(errorHandler);
};

const updateRecipe = (id, requestBody) => {
  return api.put(`/recipes/${id}`, requestBody).then((res) => res.data).catch(errorHandler);
};

const deleteRecipe = (id) => {
  return api.delete(`/recipes/${id}`).then((res) => res.data).catch(errorHandler);
};

const recipeService = {
  getRecipes,
  uploadImage,
  createRecipes,
  getOne,
  updateRecipe,
  deleteRecipe,
};

export default recipeService;
