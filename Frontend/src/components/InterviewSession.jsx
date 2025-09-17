import React, { useState, useEffect } from "react";
import { Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import apiService from "../services/api";

const InterviewSession = ({ sessionData, onInterviewComplete }) => {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sessionState, setSessionState] = useState(sessionData);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Debug logging
  console.log("InterviewSession received sessionData:", sessionData);
  console.log("sessionState:", sessionState);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Add safety checks for sessionState
  if (
    !sessionState ||
    !sessionState.data ||
    !Array.isArray(sessionState.data)
  ) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">
            Session Error
          </h2>
          <p className="text-red-600">
            Invalid session data. Please start a new interview.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionState.data[sessionState.current_question_idx];
  const progress = ((sessionState.current_question_idx + 1) / 5) * 100;

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError("Please provide an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await apiService.submitAnswer(
        sessionData.session_id,
        currentAnswer.trim()
      );

      // Update session state with feedback
      const updatedData = [...sessionState.data];
      updatedData[result.question_idx] = {
        ...updatedData[result.question_idx],
        answer: currentAnswer.trim(),
        feedback: result.feedback,
      };

      const updatedSessionState = {
        ...sessionState,
        data: updatedData,
        current_question_idx:
          result.next_question_idx || sessionState.current_question_idx + 1,
      };

      setSessionState(updatedSessionState);
      setCurrentAnswer("");

      // Check if interview is complete
      if (!result.next_question_idx) {
        onInterviewComplete(updatedSessionState);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmitAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {sessionState.job_role} Interview
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                {sessionState.experience}{" "}
                {sessionState.experience === 1 ? "year" : "years"} of experience
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                <Clock size={20} className="text-blue-600" />
                <span className="font-mono text-lg font-semibold text-gray-900">
                  {formatTime(timeElapsed)}
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Progress</div>
                <div className="text-lg font-semibold text-gray-900">
                  Question {sessionState.current_question_idx + 1} of 5
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Started</span>
              <span className="font-medium">
                {Math.round(progress)}% Complete
              </span>
              <span>Finished</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
              {sessionState.current_question_idx + 1}
            </div>
            <div className="flex-1">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Text Input */}
              <div className="space-y-4">
                <label
                  htmlFor="answer"
                  className="block text-lg font-semibold text-gray-800"
                >
                  Your Answer:
                </label>
                <div className="relative">
                  <textarea
                    id="answer"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer here... (Ctrl+Enter to submit)"
                    className="w-full h-40 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    {currentAnswer.length} characters
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Tip: Press Ctrl+Enter to submit your answer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Previous Questions with Feedback */}
        {sessionState.data
          .slice(0, sessionState.current_question_idx)
          .map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6 animate-fadeIn"
            >
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                  <CheckCircle size={20} />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      Question {index + 1}
                    </h4>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {item.question}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Your Answer:
                    </h5>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      AI Feedback:
                    </h5>
                    <div className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                      {item.feedback}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || !currentAnswer.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:shadow-none flex items-center gap-3 min-w-[180px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                Submit Answer
                <Send size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
