import "../../styles/auth.css";
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon" aria-hidden="true">🥗</span>
          <h1>Join MealPlan</h1>
          <p>Create an account to share recipes with the community.</p>
        </div>

        <form onSubmit={handleSignupSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Username</label>
            <input
              id="name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button className="auth-submit" type="submit">Create account</button>
        </form>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <div className="auth-switch">
          <p>Already have an account?</p>
          <Link className="auth-switch-link" to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
