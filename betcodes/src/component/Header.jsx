import React, { useState, useEffect } from "react";
import axios from "axios";
import "./header.css";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Fetching session & checking for authentication

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("http://localhost:4000/user/auth", {
        withCredentials: true,
      });
      if (response.data.isAuthenticated) {
        setIsAuthenticated(true);
        setUsername(response.data.user.username);
      }
    } catch (error) {
      console.error("Auth check failed", error);
    }
  };
  useEffect(() => {
    checkAuthStatus();
  }, []);


  const handleAuthModeChange = (mode) => {
    setIsLoginMode(mode === "login");
    setIsFormVisible(true);
    setErrorMessage("");
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setErrorMessage("");
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLoginMode && !username)) {
      setErrorMessage("Please fill all fields!");
      return;
    }
    const endpoint = isLoginMode
      ? "http://localhost:4000/user/login"
      : "http://localhost:4000/user/data";

    try {
      const response = await axios.post(
        endpoint,
        { username, email, password },
        { withCredentials: true }
      );

      if (!isLoginMode) {
        // ✅ Show popup when signup is successful
        setShowVerificationPopup(true);
        setIsFormVisible(false);
      } else {
        // ✅ Login success
        setIsAuthenticated(true);
        setUsername(response.data.username);
        setIsFormVisible(false);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to submit data");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/user/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      setUsername("");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src="/logo.png" alt="Bet24 Logo" className="logo-img" />
          <span className="logo-text">Bet24</span>
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-section">
              <span className="user-icon">👤</span>
              <span className="username">@{username}</span>
              <button className="btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn login" onClick={() => handleAuthModeChange("login")}>
                Login
              </button>
              <button className="btn signup" onClick={() => handleAuthModeChange("signup")}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Popup Modal */}
      {showVerificationPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>check your mail for verification</h2>
            <p>Please check your email and verify your account before Sign up.</p>
            <button className="btn close-popup" onClick={() => setShowVerificationPopup(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* ✅ Login/Signup Form */}
      {isFormVisible && (
        <div className="form-container show">
          <button className="close-btn" onClick={handleCloseForm}>&times;</button>
          <h2>{isLoginMode ? "Login" : "Sign Up"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <>
                <label>Username</label>
                <input type="text" required minLength={4} value={username} onChange={(e) => setUsername(e.target.value)} />
              </>
            )}
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="submit" className="btn submit-btn">
              {isLoginMode ? "Login" : "Sign Up"}
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
