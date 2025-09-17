import React, { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup data:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        {/* Left Section - Marketing */}
        <div className="lg:col-span-2 space-y-8">
          {/* Limited Time Offer */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-gray-500 text-sm font-medium">
              LIMITED TIME OFFER
            </span>
          </div>

          {/* CTA Button */}
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            Sign Up Now: Claim Your 5 FREE AI Interview
            <span className="text-2xl">🚀</span>
          </button>

          {/* Main Heading */}
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Join Thousands of
            </h1>
            <div className="flex items-baseline gap-2">
              <h1 className="text-5xl lg:text-6xl font-bold text-blue-600 leading-tight">
                Successful
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold text-blue-800 leading-tight">
                Candidates
              </h1>
              <div className="w-16 h-1 bg-blue-600 rounded-full ml-2"></div>
            </div>
          </div>
        </div>

        {/* Right Section - Signup Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Create a password"
                  required
                />
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Sign up
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <span className="text-gray-600">Already have an account? </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Login here
              </button>
            </div>

            {/* Recruiter Link */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
