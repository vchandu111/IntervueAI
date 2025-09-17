import React, { useState } from "react";
import {
  Briefcase,
  Clock,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Zap,
  Send,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

const AIInterview = () => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("form"); // "form", "interview", "report"
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const fetchFinalReport = React.useCallback(async () => {
    if (!sessionData?.session_id) return;

    setIsLoadingReport(true);
    try {
      const response = await fetch(
        `http://localhost:3000/sessions/${sessionData.session_id}/report`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reportData = await response.json();
      console.log("Final report:", reportData);
      setFinalReport(reportData);
    } catch (error) {
      console.error("Error fetching final report:", error);
    } finally {
      setIsLoadingReport(false);
    }
  }, [sessionData?.session_id]);

  // Fetch report when currentStep changes to "report"
  React.useEffect(() => {
    if (
      currentStep === "report" &&
      !finalReport &&
      !isLoadingReport &&
      sessionData?.session_id
    ) {
      fetchFinalReport();
    }
  }, [
    currentStep,
    finalReport,
    isLoadingReport,
    sessionData?.session_id,
    fetchFinalReport,
  ]);

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
      console.log("Session created:", sessionResponse);

      setSessionData(sessionResponse);
      setCurrentStep("interview");
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) return;

    setIsSubmittingAnswer(true);

    try {
      const response = await fetch(
        `http://localhost:3000/sessions/${sessionData.session_id}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: currentAnswer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const answerResponse = await response.json();
      console.log("Answer submitted:", answerResponse);
      console.log("Next question idx:", answerResponse.next_question_idx);
      console.log("Current question index:", currentQuestionIndex);

      // Add to progress
      setInterviewProgress((prev) => [
        ...prev,
        {
          question: sessionData.questions[currentQuestionIndex],
          answer: currentAnswer,
          user_feedback: answerResponse.user_feedback,
          admin_feedback: answerResponse.admin_feedback,
          admin_score: answerResponse.admin_score,
          admin_technical_accuracy: answerResponse.admin_technical_accuracy,
          admin_completeness: answerResponse.admin_completeness,
          admin_clarity: answerResponse.admin_clarity,
        },
      ]);

      // Check if interview is complete
      if (
        answerResponse.next_question_idx === null ||
        answerResponse.next_question_idx === undefined
      ) {
        console.log("Interview complete! Moving to report step.");
        setCurrentStep("report");
      } else if (currentQuestionIndex >= 4) {
        // Fallback: if we're on question 5 (index 4) and still getting a next question, complete the interview
        console.log(
          "Fallback: Interview complete after 5 questions. Moving to report step."
        );
        setCurrentStep("report");
      } else {
        console.log(
          "Moving to next question:",
          answerResponse.next_question_idx
        );
        setCurrentQuestionIndex(answerResponse.next_question_idx);
        setCurrentAnswer("");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

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

  // Render different steps
  if (currentStep === "interview") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              AI Interview Session
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>Role: {sessionData?.job_role}</span>
              <span>•</span>
              <span>Experience: {sessionData?.experience} years</span>
              <span>•</span>
              <span>Question {currentQuestionIndex + 1} of 5</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Question {currentQuestionIndex + 1}
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {sessionData?.questions[currentQuestionIndex]}
                </p>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Your Answer
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base resize-none"
                rows={6}
                placeholder="Type your answer here..."
                disabled={isSubmittingAnswer}
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim() || isSubmittingAnswer}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isSubmittingAnswer ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Evaluating Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Answer
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Question Feedback */}
          {interviewProgress.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Latest Feedback
              </h3>
              {(() => {
                const latestFeedback =
                  interviewProgress[interviewProgress.length - 1];
                return (
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-start space-x-3 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Question {interviewProgress.length}
                        </h4>
                        <p className="text-gray-700 mb-3">
                          {latestFeedback.question}
                        </p>
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Your Answer:
                          </p>
                          <p className="text-blue-800">
                            {latestFeedback.answer}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-900 mb-1">
                            AI Feedback:
                          </p>
                          <p className="text-green-800 whitespace-pre-wrap">
                            {latestFeedback.user_feedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === "report") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Interview Complete!
            </h1>
            <p className="text-gray-600">
              Great job! Your interview session has been completed.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Interview Report
            </h2>

            {isLoadingReport ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">
                  Generating your report...
                </span>
              </div>
            ) : finalReport ? (
              <div className="space-y-6">
                {/* Score Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {finalReport.average_score}/10
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {finalReport.completed_questions}/
                        {finalReport.total_questions}
                      </div>
                      <div className="text-sm text-gray-600">
                        Questions Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {finalReport.job_role}
                      </div>
                      <div className="text-sm text-gray-600">
                        Position Applied
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Report */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detailed Feedback
                  </h3>
                  <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {finalReport.user_report}
                    </p>
                  </div>
                </div>

                {/* Previous Q&A Summary */}
                {interviewProgress.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question & Answer Summary
                    </h3>
                    {interviewProgress.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {item.question}
                            </h4>
                            <div className="bg-white rounded p-3 mb-2">
                              <p className="text-sm text-gray-700">
                                {item.answer}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded p-3">
                              <p className="text-sm text-green-800">
                                {item.user_feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Unable to load report. Please try again.
                </p>
                <div className="mt-4 space-x-4">
                  <button
                    onClick={fetchFinalReport}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => {
                      // Force generate report by calling backend directly
                      fetchFinalReport();
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setCurrentStep("form");
                setSessionData(null);
                setCurrentQuestionIndex(0);
                setCurrentAnswer("");
                setInterviewProgress([]);
                setFinalReport(null);
                setFormData({ role: "", experience: "" });
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default form step
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-12 sm:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
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
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Let's Start Your Journey
                </h2>
                <p className="text-gray-600">
                  Tell us about your background to personalize your experience
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Role Input */}
                <div className="space-y-3">
                  <label
                    htmlFor="role"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Target Position
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                    placeholder="e.g., Senior Software Engineer, Product Manager, UX Designer"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4 inline mr-2" />
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
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                          formData.experience === option.value
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        disabled={isLoading}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.color} mx-auto mb-2`}
                        ></div>
                        <div className="text-sm font-medium">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.role || !formData.experience}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Preparing Your Interview...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Start AI Interview
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterview;
