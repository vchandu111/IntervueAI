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
  Mic,
  MicOff,
  Square,
} from "lucide-react";
import InterviewTabs from "../components/InterviewTabs";
import SkillInterview from "./SkillInterview";

const AIInterview = () => {
  const [activeTab, setActiveTab] = useState("job");
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
  });
  const [isSkillInterview, setIsSkillInterview] = useState(false);
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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check for skill interview data on component mount
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const interviewType = urlParams.get("type");

    if (interviewType === "skill") {
      const skillSessionData = localStorage.getItem("skillSessionData");
      const selectedSkills = localStorage.getItem("selectedSkills");
      const experienceLevel = localStorage.getItem("experienceLevel");

      if (skillSessionData && selectedSkills && experienceLevel) {
        try {
          const sessionData = JSON.parse(skillSessionData);
          const skills = JSON.parse(selectedSkills);

          setSessionData(sessionData);
          setIsSkillInterview(true);
          setActiveTab("skill");
          setCurrentStep("interview");
          setCurrentQuestionIndex(0);
          setIsUserReady(false);

          // Clear localStorage
          localStorage.removeItem("skillSessionData");
          localStorage.removeItem("selectedSkills");
          localStorage.removeItem("experienceLevel");

          // Welcome message with TTS
          const welcomeMessage = `Welcome to your skill-based interview session. I'll be asking you 5 questions focused on your selected skills: ${skills.join(
            ", "
          )}. Please click the "I'm Ready" button when you're prepared to begin.`;
          speakText(welcomeMessage);
        } catch (error) {
          console.error("Error parsing skill session data:", error);
        }
      }
    }
  }, []);

  const fetchFinalReport = React.useCallback(async () => {
    if (!sessionData?.session_id) return;

    setIsLoadingReport(true);
    try {
      const endpoint = isSkillInterview
        ? `http://localhost:3000/skill-sessions/${sessionData.session_id}/report`
        : `http://localhost:3000/sessions/${sessionData.session_id}/report`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reportData = await response.json();
      setFinalReport(reportData);
    } catch (error) {
      console.error("Error fetching final report:", error);
    } finally {
      setIsLoadingReport(false);
    }
  }, [sessionData?.session_id, isSkillInterview]);

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
              setIsPlayingAudio(false);
              reject(error);
            });
        } catch (error) {
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

      setSessionData(sessionResponse);
      setCurrentStep("interview");
      setCurrentQuestionIndex(0);
      setIsUserReady(false);

      // Welcome message with TTS
      const welcomeMessage = `Welcome to your AI interview session for ${formData.role} position. I'm your AI interviewer, and I'll be asking you 5 questions based on your ${formData.experience} years of experience. Please click the "I'm Ready" button when you're prepared to begin.`;
      speakText(welcomeMessage);
    } catch (error) {
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Speech-to-text function using Whisper
  const transcribeAudio = async (audioBlob) => {
    try {
      setIsProcessingAudio(true);

      const formData = new FormData();
      formData.append("audio_file", audioBlob, "audio.webm");

      const response = await fetch("http://localhost:3000/whisper", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        try {
          const transcribedText = await transcribeAudio(audioBlob);
          setTranscribedText(transcribedText);
          setCurrentAnswer(transcribedText);
        } catch (error) {
          alert("Failed to transcribe audio. Please try again.");
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) return;

    setIsSubmittingAnswer(true);

    try {
      const endpoint = isSkillInterview
        ? `http://localhost:3000/skill-sessions/${sessionData.session_id}/answers`
        : `http://localhost:3000/sessions/${sessionData.session_id}/answers`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const answerResponse = await response.json();

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

      setIsGivingFeedback(true);
      setHasSubmittedAnswer(true);
      const feedbackText = answerResponse.user_feedback;
      setNextQuestionIndex(answerResponse.next_question_idx);

      speakText(feedbackText)
        .then(() => {
          setIsGivingFeedback(false);
          if (
            answerResponse.next_question_idx === null ||
            answerResponse.next_question_idx === undefined
          ) {
            setCurrentStep("report");
          } else if (currentQuestionIndex >= 4) {
            setCurrentStep("report");
          } else {
            setShowNextQuestionButton(true);
          }
        })
        .catch(() => {
          setIsGivingFeedback(false);
          setShowNextQuestionButton(true);
        });
    } catch (error) {
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

  // ------------------- INTERVIEW SCREEN LAYOUT ONLY IS CHANGED BELOW -----------------------
  if (currentStep === "interview") {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4">
        {/* Hidden audio element for TTS */}
        <audio ref={audioRef} preload="none" />

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
                  the button below to start with the first question. Good luck!
                  🍀
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

        {/* Interview Layout - Show only when user is ready */}
        {isUserReady && (
          <>
            <div className="flex flex-col md:flex-row justify-center items-start md:items-center gap-12 md:gap-32 mb-16 w-full max-w-3xl">
              {/* AI Interviewer Side */}
              <div className="flex flex-col items-center w-full md:w-[320px] bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="w-36 h-36 rounded-full shadow-2xl overflow-hidden mb-6 border-4 border-white/50 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                    alt="AI Interviewer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  AI Interviewer
                </div>
                <div className="text-green-600 text-lg font-semibold mb-6 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  Online
                </div>
                <button
                  onClick={() => {
                    const currentQuestion =
                      sessionData?.questions[currentQuestionIndex];
                    speakText(currentQuestion);
                  }}
                  disabled={!isAudioEnabled || isPlayingAudio}
                  className="w-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl border border-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                >
                  <Volume2 className="w-5 h-5" />
                  Replay Question
                </button>
              </div>

              {/* Your Response Side */}
              <div className="flex flex-col items-center w-full md:w-[320px] bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="w-36 h-36 rounded-full shadow-2xl overflow-hidden mb-6 border-4 border-white/50 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                    alt="Your Response"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  Your Response
                </div>
                <div className="text-green-600 text-lg font-semibold mb-6 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  Responding
                </div>
                {/* Record/Stop Button */}
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessingAudio || isSubmittingAnswer}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                  >
                    <Mic className="w-5 h-5" />
                    Record Answer
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            {/* Answer Input Below */}
            <div className="w-full max-w-2xl flex flex-col items-center mb-6">
              <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200/50 rounded-xl focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 transition-all duration-300 text-base resize-none shadow-inner bg-white/50 backdrop-blur-sm"
                  rows={4}
                  placeholder="Or type your answer here if you prefer..."
                  disabled={isSubmittingAnswer || isRecording}
                />
                <div className="mt-3 text-right text-sm text-gray-500 bg-gray-50/50 px-3 py-1 rounded-lg">
                  {currentAnswer.length} characters
                </div>
              </div>
            </div>

            {/* Submit Button (gradient, full width) */}
            <div className="w-full max-w-2xl flex flex-col items-center">
              {!isGivingFeedback && !hasSubmittedAnswer && (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer.trim() || isSubmittingAnswer}
                  className="w-full py-5 rounded-2xl font-bold text-lg text-white flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 relative overflow-hidden group"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <Send className="w-6 h-6 relative z-10 group-hover:animate-bounce" />
                  <span className="relative z-10">Submit Answer</span>
                </button>
              )}
              {/* Feedback Status */}
              {isGivingFeedback && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-4 shadow-2xl w-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-lg opacity-50"></div>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
                  <span className="relative z-10">
                    AI is providing feedback...
                  </span>
                </div>
              )}
            </div>

            {/* Next Question Button */}
            {showNextQuestionButton && (
              <div className="text-center mt-8">
                <button
                  onClick={handleNextQuestion}
                  disabled={isGivingFeedback}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  <span className="relative z-10">Next Question</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  // ------------------- END INTERVIEW LAYOUT CHANGE ------------------------------------------

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
                        {isSkillInterview
                          ? "Skills Assessed"
                          : finalReport.job_role}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isSkillInterview
                          ? "Technical Skills"
                          : "Position Applied"}
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
                setIsSkillInterview(false);
                setActiveTab("job");
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

  // Render skill interview if skill tab is selected
  if (activeTab === "skill") {
    return <SkillInterview />;
  }

  // Default form step
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

        {/* Interview Tabs - Positioned above the form */}
        <InterviewTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
                      {activeTab === "job"
                        ? "Job-Based Interview"
                        : "Skill-Based Interview"}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Let's Start Your Journey
                    </span>
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {activeTab === "job"
                      ? "Tell us about your background to personalize your experience"
                      : "Select your technical skills for targeted assessment"}
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

export default AIInterview;
