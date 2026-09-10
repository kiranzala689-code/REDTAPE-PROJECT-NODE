import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const API_URL = "https://redtape-project-node-4.onrender.com";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password
        }
      );

      console.log("REGISTER RESPONSE:", response.data);

      alert("Account created successfully");

      setFormData({
        name: "",
        email: "",
        password: ""
      });

      navigate("/login");

    } catch (error) {
      console.log("REGISTER ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Registration failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="container">

        <div className="register-container">

          <h1 className="register-title">
            Create account
          </h1>

          <form onSubmit={handleRegister}>

            <div className="mb-4">

              <label className="form-label">
                Name
              </label>

              <input
                type="text"
                name="name"
                className="form-control register-input"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />

            </div>

            <div className="mb-4">

              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                className="form-control register-input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />

            </div>

            <div className="mb-4">

              <label className="form-label">
                Password
              </label>

              <input
                type="password"
                name="password"
                className="form-control register-input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 register-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>

          </form>

          <div className="signin-link">
            Already have an account?

            <Link to="/login">
              Sign In
            </Link>
          </div>

          <div className="social-buttons">

            <button
              type="button"
              className="btn facebook-btn"
            >
              <i className="bi bi-facebook"></i>
            </button>

            <button
              type="button"
              className="btn google-btn"
            >
              <strong>G</strong>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;