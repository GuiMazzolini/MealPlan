import "./AddRecipe.css";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import service from "../../services/service";
import { InputGroup, Form, Button } from "react-bootstrap";
import { AuthContext } from "../../context/auth.context";

function AddRecipes() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [time, setTime] = useState("");
  const [serving, setServing] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [prepare, setPrepare] = useState([]);
  const [newStep, setNewStep] = useState("");
  const [newIngredient, setNewIngredient] = useState({
    quantity: "",
    measure: "",
    ingredient: "",
  });

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleFileUpload = (e) => {
    const uploadData = new FormData();
    uploadData.append("imageUrl", e.target.files[0]);
    service.uploadImage(uploadData)
      .then((response) => setImageUrl(response.imageUrl))
      .catch((err) => console.error("Error uploading file:", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?._id) return;

    const requestBody = {
      name,
      type,
      serving,
      ingredients,
      time,
      prepare,
      imageUrl,
    };

    service.createRecipes(requestBody)
      .then(() => {
        setName("");
        setType("");
        setTime("");
        setServing(0);
        setIngredients([]);
        setPrepare([]);
        setImageUrl("");
        navigate("/recipes");
      })
      .catch((error) => console.error("Failed to create recipe:", error));
  };

  const handleNewIngredients = (e) => {
    const { name: field, value } = e.target;
    setNewIngredient({ ...newIngredient, [field]: value });
  };

  const addIngredients = () => {
    if (!newIngredient.ingredient) return;
    setIngredients([...ingredients, newIngredient]);
    setNewIngredient({ quantity: "", measure: "", ingredient: "" });
  };

  const addSteps = () => {
    if (!newStep.trim()) return;
    setPrepare([...prepare, newStep]);
    setNewStep("");
  };

  const deleteStep = (item) => {
    setPrepare(prepare.filter((step) => step !== item));
  };

  const deleteIngredient = (item) => {
    setIngredients(ingredients.filter((ing) => ing !== item));
  };

  return (
    <div className="form-container">
      <Form onSubmit={handleSubmit} className="add-form">
        <Form.Group className="mb-3">
          <Form.Label>Name of the recipe</Form.Label>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Servings</Form.Label>
          <Form.Control type="number" value={serving} onChange={(e) => setServing(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Time to prepare</Form.Label>
          <Form.Control
            placeholder="e.g. 1 hour, 30 minutes"
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Upload an Image (JPG or PNG)</Form.Label>
          <Form.Control className="height-fix" type="file" onChange={handleFileUpload} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Type of Food</Form.Label>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select a category</option>
            <option>Lunch / Dinner</option>
            <option>Desserts</option>
            <option>Breakfast</option>
            <option>Snacks</option>
          </Form.Select>
        </Form.Group>
        <Form.Label className="line-fix">Add Ingredients</Form.Label>
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Quantity"
            name="quantity"
            value={newIngredient.quantity}
            onChange={handleNewIngredients}
          />
          <Form.Select name="measure" value={newIngredient.measure} onChange={handleNewIngredients}>
            <option value="">Measure</option>
            <option value="milliliters">mL</option>
            <option value="units">units</option>
            <option value="grams">grams</option>
            <option value="tbs">tbs</option>
            <option value="ts">ts</option>
          </Form.Select>
          <Form.Control
            type="text"
            placeholder="Ingredient"
            name="ingredient"
            value={newIngredient.ingredient}
            onChange={handleNewIngredients}
          />
          <InputGroup.Text onClick={addIngredients} role="button">+</InputGroup.Text>
        </InputGroup>

        <Form.Label className="line-fix">How to Prepare</Form.Label>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            onChange={(e) => setNewStep(e.target.value)}
            value={newStep}
            placeholder="Write step by step here"
          />
          <InputGroup.Text onClick={addSteps} role="button">+</InputGroup.Text>
        </InputGroup>

        <Button className="create-recipe-btn" type="submit">Share Recipe</Button>
      </Form>

      <div className="form-inputs" id="details">
        <p>Ingredients:</p>
        <ul>
          {ingredients.map((eachIngredient, index) => (
            <li key={`${eachIngredient.ingredient}-${index}`}>
              {eachIngredient.quantity} {eachIngredient.measure} {eachIngredient.ingredient}
              <button type="button" className="remove-btn" onClick={() => deleteIngredient(eachIngredient)}>×</button>
            </li>
          ))}
        </ul>
        <p>Method:</p>
        <ol>
          {prepare.map((eachStep, index) => (
            <li key={`${eachStep}-${index}`}>
              {eachStep}
              <button type="button" className="remove-btn" onClick={() => deleteStep(eachStep)}>×</button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default AddRecipes;
