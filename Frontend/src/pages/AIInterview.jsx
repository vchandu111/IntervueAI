import React, { useState, useRef } from "react";
import {
  Bot,
  User,
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
  Volume2,
  VolumeX,
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isUserReady, setIsUserReady] = useState(false);
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [nextQuestionIndex, setNextQuestionIndex] = useState(null);
  const [isGivingFeedback, setIsGivingFeedback] = useState(false);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const audioRef = useRef(null);

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

  // TTS function to convert text to speech
  const speakText = React.useCallback(
    async (text, voice = "alloy") => {
      if (!isAudioEnabled || !text.trim()) return Promise.resolve();

      return new Promise((resolve, reject) => {
        try {
          setIsPlayingAudio(true);

          fetch("http://localhost:3000/tts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: text,
              voice: voice,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.blob();
            })
            .then((audioBlob) => {
              const audioUrl = URL.createObjectURL(audioBlob);

              if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();

                audioRef.current.onended = () => {
                  setIsPlayingAudio(false);
                  URL.revokeObjectURL(audioUrl);
                  resolve();
                };

                audioRef.current.onerror = () => {
                  setIsPlayingAudio(false);
                  URL.revokeObjectURL(audioUrl);
                  reject(new Error("Audio playback failed"));
                };
              } else {
                reject(new Error("Audio element not available"));
              }
            })
            .catch((error) => {
              console.error("Error generating speech:", error);
              setIsPlayingAudio(false);
              reject(error);
            });
        } catch (error) {
          console.error("Error in speakText:", error);
          setIsPlayingAudio(false);
          reject(error);
        }
      });
    },
    [isAudioEnabled]
  );

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

  // Auto-speak questions when they change (only after user is ready)
  React.useEffect(() => {
    if (
      currentStep === "interview" &&
      sessionData?.questions &&
      sessionData.questions[currentQuestionIndex] &&
      isUserReady
    ) {
      const currentQuestion = sessionData.questions[currentQuestionIndex];
      speakText(currentQuestion);
    }
  }, [
    currentQuestionIndex,
    currentStep,
    sessionData?.questions,
    speakText,
    isUserReady,
  ]);

  // Handle "I'm Ready" button click
  const handleReadyClick = () => {
    setIsUserReady(true);
    // Speak the first question
    if (sessionData?.questions && sessionData.questions[0]) {
      const firstQuestion = sessionData.questions[0];
      speakText(firstQuestion);
    }
  };

  const handleNextQuestion = () => {
    if (nextQuestionIndex !== null) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setCurrentAnswer("");
      setShowNextQuestionButton(false);
      setNextQuestionIndex(null);
      setIsGivingFeedback(false);
      setHasSubmittedAnswer(false);

      // Speak the next question
      const nextQuestion = sessionData.questions[nextQuestionIndex];
      speakText(nextQuestion);
    }
  };

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
      setIsUserReady(false);

      // Welcome message with TTS
      const welcomeMessage = `Welcome to your AI interview session for ${formData.role} position. I'm your AI interviewer, and I'll be asking you 5 questions based on your ${formData.experience} years of experience. Please click the "I'm Ready" button when you're prepared to begin.`;
      speakText(welcomeMessage);
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

      // Set feedback state and speak the feedback
      setIsGivingFeedback(true);
      setHasSubmittedAnswer(true);
      const feedbackText = answerResponse.user_feedback;

      // Store the next question index for the "Next Question" button
      setNextQuestionIndex(answerResponse.next_question_idx);

      // Speak feedback and handle completion based on audio ending
      speakText(feedbackText)
        .then(() => {
          // This will be called when audio finishes
          setIsGivingFeedback(false);

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
            // Show "Next Question" button after feedback is spoken
            setShowNextQuestionButton(true);
          }
        })
        .catch(() => {
          // If audio fails, still proceed
          setIsGivingFeedback(false);
          setShowNextQuestionButton(true);
        });
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
      setIsGivingFeedback(false);
      setHasSubmittedAnswer(false);
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
      <div className="min-h-screen bg-gray-100 py-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>

          {/* Floating particles */}
          <div
            className="absolute top-20 left-10 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-40 right-20 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-40 left-20 w-2 h-2 bg-indigo-400/40 rounded-full animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "3.5s" }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-3 h-3 bg-cyan-400/40 rounded-full animate-bounce"
            style={{ animationDelay: "3s", animationDuration: "4.5s" }}
          ></div>
        </div>

        {/* Hidden audio element for TTS */}
        <audio ref={audioRef} preload="none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header with AI Avatar */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              {/* AI Avatar with Enhanced Design */}
              <div className="relative group">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse"></div>

                {/* Main avatar container */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  {/* Glassmorphism inner circle */}
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                    <Bot className="w-10 h-10 text-blue-600" />
                  </div>
                </div>

                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-300/50 animate-ping"></div>
                <div
                  className="absolute inset-0 rounded-full border border-purple-300/30 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>

                {/* Floating sparkles */}
                <div
                  className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping"
                  style={{ animationDelay: "1.5s" }}
                ></div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Interview Session
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm mb-6">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-700">
                  Role: {sessionData?.job_role}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <div
                  className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <span className="font-medium text-gray-700">
                  Experience: {sessionData?.experience} years
                </span>
              </div>
            </div>
          </div>

          {/* I'm Ready Button - Show only when user is not ready yet */}
          {!isUserReady && (
            <div className="text-center mb-16">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-16 border border-white/20 max-w-3xl mx-auto relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-indigo-50/50 rounded-3xl"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="relative mb-10">
                    {/* Enhanced decorative elements */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce shadow-lg"></div>
                    <div
                      className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-lg"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="absolute top-1/2 -left-8 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                      className="absolute top-1/2 -right-8 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce shadow-lg"
                      style={{ animationDelay: "1.5s" }}
                    ></div>
                  </div>

                  <h2 className="text-4xl font-bold mb-8">
                    <span className="bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Ready to Begin Your Interview?
                    </span>
                  </h2>

                  <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Take a moment to prepare yourself. When you're ready, click
                    the button below to start with the first question. Good
                    luck! 🍀
                  </p>

                  <button
                    onClick={handleReadyClick}
                    disabled={isPlayingAudio}
                    className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white px-16 py-6 rounded-3xl font-bold text-2xl transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-3 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-6 mx-auto relative overflow-hidden group"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                    {isPlayingAudio ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Please wait...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl group-hover:animate-bounce">
                          🚀
                        </span>
                        <span>I'm Ready!</span>
                        <span className="text-3xl group-hover:animate-pulse">
                          ✨
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Question Card - Show only when user is ready */}
          {isUserReady && (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 mb-12 max-w-4xl mx-auto relative overflow-hidden">
              {/* Enhanced Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-indigo-50/40 rounded-3xl"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-cyan-200/15 to-blue-200/15 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "4s" }}
              ></div>

              <div className="relative z-10">
                {/* Enhanced Replay Question Button */}
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => {
                      const currentQuestion =
                        sessionData?.questions[currentQuestionIndex];
                      speakText(currentQuestion);
                    }}
                    disabled={!isAudioEnabled || isPlayingAudio}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Volume2 size={12} className="text-white" />
                    </div>
                    <span className="font-medium text-sm">Replay</span>
                  </button>
                </div>

                {/* Enhanced Question Content */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-100/80 shadow-lg relative overflow-hidden">
                  {/* Subtle background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 rounded-2xl"></div>
                  <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-200/5 to-purple-200/5 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-indigo-200/5 to-pink-200/5 rounded-full blur-xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Question
                      </span>
                    </div>
                    <p className="text-gray-800 text-xl leading-relaxed font-medium">
                      {sessionData?.questions[currentQuestionIndex]}
                    </p>
                  </div>
                </div>

                {/* Enhanced Answer Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <label className="text-lg font-semibold text-gray-800">
                      Your Answer
                    </label>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg resize-none shadow-sm bg-white/95 backdrop-blur-sm group-hover:shadow-md group-hover:border-gray-300"
                      rows={6}
                      placeholder="Share your thoughts and experience here. Be specific and provide examples when possible..."
                      disabled={isSubmittingAnswer}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-100">
                      {currentAnswer.length} characters
                    </div>
                  </div>
                </div>

                {/* Enhanced Submit Button - Hide during feedback and after submission */}
                {!isGivingFeedback && !hasSubmittedAnswer && (
                  <div className="mt-6">
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!currentAnswer.trim() || isSubmittingAnswer}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                      {isSubmittingAnswer ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Evaluating Your Answer...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Enhanced Feedback Status - Show during feedback */}
                {isGivingFeedback && (
                  <div className="mt-6 text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>AI is providing feedback...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Question Button - Show after feedback is spoken */}
          {showNextQuestionButton && (
            <div className="text-center mt-8">
              <button
                onClick={handleNextQuestion}
                disabled={isGivingFeedback}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Next Question</span>
              </button>
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
                setIsPlayingAudio(false);
                setIsAudioEnabled(true);
                setIsUserReady(false);
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.src = "";
                }
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
