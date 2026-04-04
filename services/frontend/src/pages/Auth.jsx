import { useState } from "react";
import { useAuth } from "../AuthProvider";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogIn } = useAuth();

  return (
    <div className="position-relative h-100">
      <div className="auth mt-5 p-lg-5 p-3 rounded-5 position-absolute top-50 start-50 translate-middle">
        <h1 className="fw-bold mb-lg-3">Central Authentication Service</h1>
        <h3 className="mb-lg-5 mb-3">Enter your Email and Password</h3>
        <div className="d-flex flex-column mb-lg-4 mb-2">
          <label className="form-label" for="emailInput">Email address</label>
          <input
            className="form-control"
            id="emailInput"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="d-flex flex-column mb-lg-5 mb-3">
          <label className="form-label" for="passInput">Password</label>
          <input
            className="form-control"
            id="passInput"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="login btn w-100 fw-bold text-white"
          type="submit"
          onClick={() => handleLogIn({ email, password })}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Auth;