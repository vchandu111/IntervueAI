import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD3mYKInDMKAyi51HV1d7e9nKz5yw1UzvU",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Login successful:", result);
        // Store token and user info in localStorage
        localStorage.setItem("authToken", result.idToken);
        localStorage.setItem("userEmail", result.email);
        localStorage.setItem(
          "userDisplayName",
          result.displayName || result.email.split("@")[0]
        );
        // Navigate to dashboard or home
        navigate("/");
        // Refresh the page to update navbar
        window.location.reload();
      } else {
        setError(
          result.error?.message ||
            "Login failed. Please check your credentials and try again."
        );
        console.error("Login error:", result);
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12 items-center">
        {/* Left Section - Welcome Message */}
        <div className="lg:col-span-1 xl:col-span-2 space-y-6 sm:space-y-8 text-center lg:text-left">
          {/* Welcome Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome Back to
            </h1>
            <div className="flex flex-col sm:flex-row items-center lg:items-baseline gap-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 leading-tight">
                Your Success
              </h1>
              <div className="w-12 sm:w-16 h-1 bg-blue-600 rounded-full ml-0 sm:ml-2"></div>
            </div>
          </div>

          {/* Status Indicators */}
        </div>

        {/* Right Section - Login Form */}
        <div className="lg:col-span-1 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Signup Link */}
            <div className="text-center mt-4 sm:mt-6">
              <span className="text-gray-600 text-sm sm:text-base">
                Don't have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                Register here
              </button>
            </div>

            {/* Recruiter Link */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
