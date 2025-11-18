import React from "react";
import "../styles/theme.css";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginUser = () => {
  const Navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/auth/user/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response.data);
        // store token from response body (fallback if cookie isn't usable)
        if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        Navigate("/");
      })
      .catch((err) => {
        console.log("There was an error: ", err);
      });
  };
  return (
    <div className="auth-page theme-transition">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-dot" />
          <div>
            <div className="brand-title">FoodReels</div>
            <div className="brand-sub">Sign in to your account</div>
          </div>
        </div>

        <div className="auth-switch">
          <a className="link" href="/user/register">
            Register as normal user
          </a>
          <span className="muted-sep">·</span>
          <a className="link" href="/food-partner/register">
            Register as food partner
          </a>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" />
          </div>

          <div className="auth-actions">
            <div className="small">
              <a className="link" href="#">
                Forgot password?
              </a>
            </div>
            <button className="btn">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginUser;
