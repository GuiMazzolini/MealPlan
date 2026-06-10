import "../../styles/auth.css";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import api from "../../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(undefined);

  const navigate = useNavigate();
  const { storeToken, authenticateUser } = useContext(AuthContext);

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    api.post("/auth/login", { email, password })
      .then((response) => {
        storeToken(response.data.authToken);
        authenticateUser();
        navigate("/");
      })
      .catch((error) => {
        setErrorMessage(error.response?.data?.message || "Login failed.");
      });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon" aria-hidden="true">🥗</span>
          <h1>Welcome back</h1>
          <p>Sign in to share recipes and plan your meals.</p>
        </div>

        <form onSubmit={handleLoginSubmit}>
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button className="auth-submit" type="submit">Log in</button>
        </form>

        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        <div className="auth-switch">
          <p>Don&apos;t have an account yet?</p>
          <Link className="auth-switch-link" to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
