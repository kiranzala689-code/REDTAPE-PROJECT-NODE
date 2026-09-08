import React, { useState } from "react";
import { Link } from "react-router-dom";


function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      // Yaha baad me tumhari forgot-password API lagegi

      console.log("EMAIL:", email);

      alert("Password reset link request sent");

    } catch (error) {
      console.log("FORGOT PASSWORD ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      <div className="container">

        <div className="forgot-container">

          <h1 className="forgot-title">
            Forgot password?
          </h1>

          <p className="forgot-text">
            Enter your email address and we'll send you
            instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="mb-4">

              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control forgot-input"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 forgot-btn"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "SEND RESET LINK"}
            </button>

          </form>

          <div className="back-login">

            <Link to="/login">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;