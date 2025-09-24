import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  Briefcase,
  Clock,
} from "lucide-react";

const JobSelection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const experienceOptions = [
    { value: "0-1", label: "0-1 years", color: "from-green-400 to-green-600" },
    { value: "1-2", label: "1-2 years", color: "from-blue-400 to-blue-600" },
    {
      value: "2-3",
      label: "2-3 years",
      color: "from-purple-400 to-purple-600",
    },
    { value: "3-5", label: "3-5 years", color: "from-pink-400 to-pink-600" },
    {
      value: "5-7",
      label: "5-7 years",
      color: "from-orange-400 to-orange-600",
    },
    { value: "7-10", label: "7-10 years", color: "from-red-400 to-red-600" },
    {
      value: "10+",
      label: "10+ years",
      color: "from-indigo-400 to-indigo-600",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create session with backend
      const response = await fetch("http://localhost:3000/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_role: formData.role,
          experience: parseInt(formData.experience.split("-")[0]) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sessionResponse = await response.json();

      // Navigate to interview with session data
      navigate("/interview-session", {
        state: {
          type: "job",
          sessionData: sessionResponse,
          jobRole: formData.role,
          experience: formData.experience,
        },
      });
    } catch (error) {
      console.error("Error starting job interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview
            </span>
            <br />
            <span className="text-gray-700">Practice Studio</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Elevate your interview game with intelligent practice sessions that
            adapt to your career level
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Sidebar - Features */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                What You'll Get
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Smart Questions
                    </h4>
                    <p className="text-sm text-gray-600">
                      AI-generated questions based on your role and experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Instant Feedback
                    </h4>
                    <p className="text-sm text-gray-600">
                      Real-time analysis of your responses and suggestions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Progress Tracking
                    </h4>
                    <p className="text-sm text-gray-600">
                      Detailed analytics to monitor your improvement
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Success Stories</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">JS</span>
                  </div>
                  <div>
                    <div className="font-medium">John Smith</div>
                    <div className="text-sm opacity-90">
                      Software Engineer at Google
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">SM</span>
                  </div>
                  <div>
                    <div className="font-medium">Sarah Miller</div>
                    <div className="text-sm opacity-90">
                      Product Manager at Meta
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 rounded-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-200/10 to-pink-200/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">
                      Job-Based Interview
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Let's Start Your Journey
                    </span>
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Tell us about your background to personalize your experience
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Role Input */}
                  <div className="space-y-4">
                    <label
                      htmlFor="role"
                      className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-100"
                    >
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Target Position
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 transition-all duration-300 text-lg shadow-inner placeholder-gray-400"
                        placeholder="e.g., Senior Software Engineer, Product Manager, UX Designer"
                        required
                        disabled={isLoading}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Experience Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {experienceOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              experience: option.value,
                            }))
                          }
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center group ${
                            formData.experience === option.value
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 shadow-xl transform scale-105"
                              : "border-gray-200/50 hover:border-blue-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-lg hover:scale-105"
                          }`}
                          disabled={isLoading}
                        >
                          {/* Background gradient overlay */}
                          <div
                            className={`absolute inset-0 rounded-xl bg-gradient-to-r ${option.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                          ></div>

                          <div className="relative z-10">
                            <div
                              className={`w-4 h-4 rounded-full bg-gradient-to-r ${option.color} mx-auto mb-3 shadow-lg`}
                            ></div>
                            <div className="text-sm font-semibold">
                              {option.label}
                            </div>
                          </div>

                          {/* Selection indicator */}
                          {formData.experience === option.value && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={
                        isLoading || !formData.role || !formData.experience
                      }
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 relative overflow-hidden group"
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
                          <span className="relative z-10">
                            Preparing Your Interview...
                          </span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-6 h-6 relative z-10 group-hover:animate-bounce" />
                          <span className="relative z-10">
                            Start AI Interview
                          </span>
                          <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSelection;
