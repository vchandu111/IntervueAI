import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">Sign in to your IntervueAI account</p>
          </div>

          <form className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign up here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
