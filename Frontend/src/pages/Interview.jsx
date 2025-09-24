import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get interview type and data from navigation state or localStorage
  const interviewType =
    location.state?.type ||
    new URLSearchParams(window.location.search).get("type");
  const [isSkillInterview, setIsSkillInterview] = useState(
    interviewType === "skill"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("interview"); // "interview", "report"
  const [sessionData, setSessionData] = useState(
    location.state?.sessionData || null
  );
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
  const [welcomeMessagePlayed, setWelcomeMessagePlayed] = useState(false);
  const [cameraTest, setCameraTest] = useState({
    isTesting: false,
    hasPermission: false,
    stream: null,
  });
  const [micTest, setMicTest] = useState({
    isTesting: false,
    hasPermission: false,
    level: 0,
  });
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const cameraPreviewRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

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

  // Cleanup camera and microphone on unmount
  React.useEffect(() => {
    return () => {
      if (cameraTest.stream) {
        cameraTest.stream.getTracks().forEach((track) => track.stop());
      }
      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = null;
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [cameraTest.stream]);

  // Check for interview data on component mount and play welcome message
  React.useEffect(() => {
    if (interviewType === "skill" && !sessionData) {
      const skillSessionData = localStorage.getItem("skillSessionData");
      const selectedSkills = localStorage.getItem("selectedSkills");
      const experienceLevel = localStorage.getItem("experienceLevel");

      if (skillSessionData && selectedSkills && experienceLevel) {
        try {
          const sessionData = JSON.parse(skillSessionData);
          const skills = JSON.parse(selectedSkills);

          setSessionData(sessionData);
          setIsSkillInterview(true);
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
          )}. Before we begin, please test your camera and microphone to ensure everything is working properly. Click the test buttons below, then click "I'm Ready" when you're prepared to begin.`;
          speakText(welcomeMessage)
            .then(() => {
              setWelcomeMessagePlayed(true);
            })
            .catch(() => {
              setWelcomeMessagePlayed(true);
            });
        } catch (error) {
          console.error("Error parsing skill session data:", error);
        }
      }
    } else if (sessionData && !isUserReady && !welcomeMessagePlayed) {
      // Play welcome message for job-based interviews or direct navigation
      const welcomeMessage = isSkillInterview
        ? `Welcome to your skill-based interview session. I'll be asking you 5 questions focused on your selected technical skills. Before we begin, please test your camera and microphone to ensure everything is working properly. Click the test buttons below, then click "I'm Ready" when you're prepared to begin.`
        : `Welcome to your AI interview session for ${
            sessionData.job_role || "your selected position"
          }. I'm your AI interviewer, and I'll be asking you 5 questions based on your experience level. Before we begin, please test your camera and microphone to ensure everything is working properly. Click the test buttons below, then click "I'm Ready" when you're prepared to begin.`;

      speakText(welcomeMessage)
        .then(() => {
          setWelcomeMessagePlayed(true);
        })
        .catch(() => {
          setWelcomeMessagePlayed(true);
        });
    }
  }, [
    interviewType,
    sessionData,
    isSkillInterview,
    isUserReady,
    welcomeMessagePlayed,
    speakText,
  ]);

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

  // Camera test function
  const testCamera = async () => {
    setCameraTest((prev) => ({ ...prev, isTesting: true }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      console.log("Camera stream obtained:", stream);

      if (cameraPreviewRef.current) {
        cameraPreviewRef.current.srcObject = stream;
        console.log("Video element updated with stream");

        // Wait for the video to load
        cameraPreviewRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          cameraPreviewRef.current.play().catch(console.error);
        };
      }

      setCameraTest({
        isTesting: false,
        hasPermission: true,
        stream: stream,
      });

      // Speak confirmation that camera is working
      await speakText(
        "Camera test successful! You can see yourself on screen. Click stop test when you're ready."
      );
    } catch (error) {
      console.error("Camera access denied:", error);
      setCameraTest({
        isTesting: false,
        hasPermission: false,
        stream: null,
      });

      // Speak error message
      await speakText(
        "Camera access was denied. Please allow camera permission to test your video."
      );
    }
  };

  // Stop camera test
  const stopCameraTest = async () => {
    if (cameraTest.stream) {
      cameraTest.stream.getTracks().forEach((track) => track.stop());
    }
    if (cameraPreviewRef.current) {
      cameraPreviewRef.current.srcObject = null;
    }
    setCameraTest({ isTesting: false, hasPermission: false, stream: null });

    // Speak confirmation that camera test is stopped
    await speakText(
      "Camera test stopped. You can now test your microphone or proceed with the interview."
    );
  };

  // Microphone test function
  const testMicrophone = async () => {
    setMicTest((prev) => ({ ...prev, isTesting: true }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context for level monitoring
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      // Speak instructions for microphone test
      await speakText(
        "Microphone test started! Please speak into your microphone. You should see the audio level bars moving. Say something like 'Hello, this is my microphone test'."
      );

      // Start monitoring audio level
      const monitorAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);

          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setMicTest((prev) => ({
            ...prev,
            isTesting: false,
            hasPermission: true,
            level: average,
          }));

          requestAnimationFrame(monitorAudioLevel);
        }
      };

      monitorAudioLevel();
    } catch (error) {
      console.error("Microphone access denied:", error);
      setMicTest({
        isTesting: false,
        hasPermission: false,
        level: 0,
      });

      // Speak error message
      await speakText(
        "Microphone access was denied. Please allow microphone permission to test your audio."
      );
    }
  };

  // Stop microphone test
  const stopMicrophoneTest = async () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setMicTest({ isTesting: false, hasPermission: false, level: 0 });

    // Speak confirmation that microphone test is stopped
    await speakText(
      "Microphone test stopped. Your devices are ready! You can now click 'I'm Ready' to begin your interview."
    );
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

  // If no session data, redirect to appropriate selection page
  if (!sessionData) {
    if (isSkillInterview) {
      navigate("/skill-selection");
    } else {
      navigate("/job-selection");
    }
    return null;
  }

  // Interview screen layout
  if (currentStep === "interview") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-r from-indigo-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-cyan-200/20 to-green-200/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "5s" }}
          ></div>
        </div>
        {/* Hidden audio element for TTS */}
        <audio ref={audioRef} preload="none" />

        {/* Video element for camera test */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
          style={{ width: "320px", height: "240px" }}
        />

        {/* I'm Ready Button - Show only when user is not ready yet */}
        {!isUserReady && (
          <div className="text-center mb-16">
            <div className=" rounded-3xl  p-16 border border-white/20 max-w-4xl mx-auto relative overflow-hidden">
              {/* Enhanced Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-indigo-50/60 rounded-3xl"></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>

              <div className="relative z-10">
                {/* Interview Type Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full border border-blue-200 mb-8 shadow-lg">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {isSkillInterview
                      ? "🎯 Skill-Based Interview"
                      : "💼 Job-Based Interview"}
                  </span>
                </div>

                {/* Progress Indicator */}

                {/* Enhanced decorative elements with more variety */}
                <div className="relative mb-12">
                  <div className="absolute -top-6 -left-6 w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce shadow-lg"></div>
                  <div
                    className="absolute -bottom-6 -right-6 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute top-1/2 -left-10 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div
                    className="absolute top-1/2 -right-10 w-7 h-7 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "1.5s" }}
                  ></div>
                  <div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "2s" }}
                  ></div>
                  <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full animate-bounce shadow-lg"
                    style={{ animationDelay: "2.5s" }}
                  ></div>
                </div>

                {/* Enhanced Title with better styling */}
                <h2 className="text-5xl font-bold mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Ready to Begin Your Interview?
                  </span>
                </h2>

                {/* Interview Info Cards */}

                {/* Device Testing Section - Moved Above Button */}
                <div className="mb-12">
                  <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100/50 shadow-xl">
                    <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Test Your Devices
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Camera Test */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-2xl">📹</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-6">
                            Camera Test
                          </h4>

                          {cameraTest.hasPermission ? (
                            <div className="space-y-4">
                              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner border-2 border-green-200 relative">
                                <video
                                  ref={cameraPreviewRef}
                                  autoPlay
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                  style={{ transform: "scaleX(-1)" }}
                                />
                                {(!cameraTest.stream ||
                                  cameraTest.isTesting) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <div className="text-center">
                                      <div className="text-4xl text-gray-400 mb-2">
                                        📷
                                      </div>
                                      <p className="text-gray-500 font-medium">
                                        {cameraTest.isTesting
                                          ? "Starting camera..."
                                          : "Camera not active"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-center gap-3 text-green-600 bg-green-50 rounded-xl p-3 border border-green-200">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-semibold">
                                  Camera Working Perfectly!
                                </span>
                              </div>
                              <button
                                onClick={stopCameraTest}
                                disabled={isPlayingAudio}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
                              >
                                {isPlayingAudio
                                  ? "AI Speaking..."
                                  : "Stop Camera Test"}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <div className="text-6xl text-gray-400 mb-2">
                                    📷
                                  </div>
                                  <p className="text-gray-500 font-medium">
                                    Camera Preview
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={testCamera}
                                disabled={
                                  cameraTest.isTesting || isPlayingAudio
                                }
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center gap-3 mx-auto"
                              >
                                {cameraTest.isTesting ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Testing Camera...
                                  </>
                                ) : isPlayingAudio ? (
                                  <>
                                    <span className="text-xl">🔇</span>
                                    AI Speaking...
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xl">🎥</span>
                                    Test My Camera
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Microphone Test */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-2xl">🎤</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-800 mb-6">
                            Microphone Test
                          </h4>

                          {micTest.hasPermission ? (
                            <div className="space-y-4">
                              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-green-200 shadow-inner">
                                <div className="flex items-center gap-4">
                                  <div className="flex gap-2">
                                    {[...Array(8)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-2 h-12 rounded-full transition-all duration-200 ${
                                          micTest.level > i * 12.5
                                            ? "bg-gradient-to-t from-green-400 to-green-600"
                                            : "bg-gray-300"
                                        }`}
                                      ></div>
                                    ))}
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      {Math.round(micTest.level)}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Audio Level
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-center gap-3 text-green-600 bg-green-50 rounded-xl p-3 border border-green-200">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-semibold">
                                  Microphone Working Great!
                                </span>
                              </div>
                              <button
                                onClick={stopMicrophoneTest}
                                disabled={isPlayingAudio}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg"
                              >
                                {isPlayingAudio
                                  ? "AI Speaking..."
                                  : "Stop Microphone Test"}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <div className="text-4xl text-gray-400 mb-2">
                                    🎤
                                  </div>
                                  <p className="text-gray-500 font-medium">
                                    Audio Level Monitor
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={testMicrophone}
                                disabled={micTest.isTesting || isPlayingAudio}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center gap-3 mx-auto"
                              >
                                {micTest.isTesting ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Testing Microphone...
                                  </>
                                ) : isPlayingAudio ? (
                                  <>
                                    <span className="text-xl">🔇</span>
                                    AI Speaking...
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xl">🎤</span>
                                    Test My Microphone
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Status Message */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 mb-12">
                  <div className="flex items-center justify-center gap-3">
                    {isPlayingAudio ? (
                      <>
                        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg font-semibold text-blue-700">
                          Please wait...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-lg font-semibold text-gray-700">
                          Take a moment to prepare yourself. When you're ready,
                          click the button below to start with the first
                          question. Good luck! 🍀
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Enhanced Ready Button */}
                <button
                  onClick={handleReadyClick}
                  disabled={isPlayingAudio}
                  className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white px-20 py-8 rounded-3xl font-bold text-2xl transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-3 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-6 mx-auto relative overflow-hidden group"
                >
                  {/* Enhanced Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                  {/* Button background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl"></div>

                  {isPlayingAudio ? (
                    <>
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
                      <span className="relative z-10 text-xl">
                        Please wait...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl group-hover:animate-bounce relative z-10">
                        🚀
                      </span>
                      <span className="relative z-10 text-xl">I'm Ready!</span>
                      <span className="text-4xl group-hover:animate-pulse relative z-10">
                        ✨
                      </span>
                    </>
                  )}
                </button>

                {/* Additional Tips */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          Pro Tip
                        </div>
                        <div className="text-sm text-gray-600">
                          Speak clearly and take your time
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎯</div>
                      <div>
                        <div className="font-semibold text-gray-800">Focus</div>
                        <div className="text-sm text-gray-600">
                          Be specific and provide examples
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

  // Report screen
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
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (isSkillInterview) {
                  navigate("/skill-selection");
                } else {
                  navigate("/job-selection");
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

  return null;
};

export default Interview;
