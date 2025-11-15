import React from "react";
import "../styles/theme.css";
import "../styles/auth.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPartner = () => {
  const Navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const businessName = e.target.businessName.value;
    const ownerName = e.target.ownerName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const address = e.target.address.value;

    const response = await axios
      .post(
        "http://localhost:3000/api/auth/food-partner/register",
        {
          name: businessName,
          ownerName,
          email,
          password,
          address,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response.data);
        Navigate("/create-food");
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
            <div className="brand-title">Food Partner</div>
            <div className="brand-sub">Create a food-partner account</div>
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
            <label>Business name</label>
            <input name="businessName" placeholder="e.g. Tasty Bites" />
          </div>

          <div className="form-row">
            <label>Owner name</label>
            <input name="ownerName" placeholder="Owner full name" />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="partner@example.com"
            />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" />
          </div>

          <div className="form-row">
            <label>Address (optional)</label>
            <input placeholder="Street, city" name="address" />
          </div>

          <div className="auth-actions">
            <div className="small">
              Already registered?{" "}
              <a className="link" href="/food-partner/login">
                Sign in
              </a>
            </div>
            <button className="btn">Create account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPartner;
