import "./SignupPage.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState(undefined);

  const navigate = useNavigate();

  const handleSignupSubmit = (e) => {
    e.preventDefault();

    api.post("/auth/signup", { email, password, name })
      .then(() => navigate("/login"))
      .catch((error) => {
        setErrorMessage(error.response?.data?.message || "Signup failed.");
      });
  };

  return (
    <div className="wrapper--signup">
      <div className="image-holder" aria-hidden="true" />
      <div className="form-inner">
        <form onSubmit={handleSignupSubmit}>
          <div className="form-header">
            <h3>Sign up</h3>
          </div>
          <div className="form-group">
            <label htmlFor="name">Username:</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="create-acc-btn" type="submit">Create my account</button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="to-login">
          <h6>Already have an account?</h6>
          <Link className="login-btn" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
