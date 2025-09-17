import React, { useState } from "react";
import { User, Briefcase, Star, ArrowRight } from "lucide-react";
import apiService from "../services/api";

const InterviewSetup = ({ onSessionCreated }) => {
  const [formData, setFormData] = useState({
    jobRole: "",
    experience: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const jobRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer",
    "Data Scientist",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Product Manager",
    "UX Designer",
    "UI Designer",
    "Mobile Developer",
    "QA Engineer",
    "System Administrator",
    "Database Administrator",
    "Cybersecurity Analyst",
    "Cloud Engineer",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? parseInt(value) : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.jobRole) {
      setError("Please select a job role");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sessionData = await apiService.createSession(
        formData.jobRole,
        formData.experience
      );
      console.log("Session data received:", sessionData);
      onSessionCreated(sessionData);
    } catch (err) {
      console.error("Error creating session:", err);
      setError("Failed to create interview session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Set Up Your Interview
        </h2>
        <p className="text-gray-600">
          Tell us about your target role and experience level to get
          personalized questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-2" />
            Job Role
          </label>
          <select
            name="jobRole"
            value={formData.jobRole}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select your target job role</option>
            {jobRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Star className="inline w-4 h-4 mr-2" />
            Years of Experience
          </label>
          <div className="relative">
            <input
              type="range"
              name="experience"
              min="0"
              max="20"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0</span>
              <span className="font-medium text-blue-600">
                {formData.experience}{" "}
                {formData.experience === 1 ? "year" : "years"}
              </span>
              <span>20+</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Session...
            </>
          ) : (
            <>
              Start Interview
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">What to Expect:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• 5 technical questions tailored to your role and experience</li>
          <li>• Real-time AI feedback after each answer</li>
          <li>• Comprehensive final report with recommendations</li>
          <li>• Takes approximately 15-30 minutes to complete</li>
        </ul>
      </div>
    </div>
  );
};

export default InterviewSetup;
