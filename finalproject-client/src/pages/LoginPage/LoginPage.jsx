import "./LoginPage.css";
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
    <div className="wrapper--signup">
      <div className="image-holder" aria-hidden="true" />
      <div className="form-inner">
        <form onSubmit={handleLoginSubmit}>
          <div className="form-header">
            <h1>Login</h1>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              className="form-control"
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              className="form-control"
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="create-acc-btn" type="submit">Login</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="to-login">
          <p>Don&apos;t have an account yet?</p>
          <Link className="login-btn" to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
