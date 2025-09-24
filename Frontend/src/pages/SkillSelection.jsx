import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Code,
  Database,
  Globe,
  Smartphone,
  Cloud,
  Shield,
  Cpu,
  GitBranch,
} from "lucide-react";

const SkillSelection = () => {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const skillCategories = [
    {
      id: "frontend",
      name: "Frontend Development",
      icon: Globe,
      color: "from-blue-400 to-blue-600",
      skills: [
        {
          id: "react",
          name: "React",
          description: "Component-based UI library",
        },
        {
          id: "vue",
          name: "Vue.js",
          description: "Progressive JavaScript framework",
        },
        {
          id: "angular",
          name: "Angular",
          description: "TypeScript-based framework",
        },
        {
          id: "javascript",
          name: "JavaScript",
          description: "Core programming language",
        },
        {
          id: "typescript",
          name: "TypeScript",
          description: "Typed JavaScript superset",
        },
        { id: "html", name: "HTML", description: "Markup language" },
        { id: "css", name: "CSS", description: "Styling language" },
        { id: "sass", name: "Sass/SCSS", description: "CSS preprocessor" },
      ],
    },
    {
      id: "backend",
      name: "Backend Development",
      icon: Database,
      color: "from-green-400 to-green-600",
      skills: [
        { id: "nodejs", name: "Node.js", description: "JavaScript runtime" },
        {
          id: "python",
          name: "Python",
          description: "High-level programming language",
        },
        { id: "java", name: "Java", description: "Object-oriented language" },
        {
          id: "csharp",
          name: "C#",
          description: "Microsoft's programming language",
        },
        { id: "php", name: "PHP", description: "Server-side scripting" },
        {
          id: "ruby",
          name: "Ruby",
          description: "Dynamic programming language",
        },
        { id: "go", name: "Go", description: "Google's programming language" },
        {
          id: "rust",
          name: "Rust",
          description: "Systems programming language",
        },
      ],
    },
    {
      id: "mobile",
      name: "Mobile Development",
      icon: Smartphone,
      color: "from-purple-400 to-purple-600",
      skills: [
        {
          id: "react-native",
          name: "React Native",
          description: "Cross-platform mobile",
        },
        { id: "flutter", name: "Flutter", description: "Google's UI toolkit" },
        { id: "swift", name: "Swift", description: "iOS development" },
        { id: "kotlin", name: "Kotlin", description: "Android development" },
        { id: "ionic", name: "Ionic", description: "Hybrid mobile framework" },
        {
          id: "xamarin",
          name: "Xamarin",
          description: "Microsoft's mobile platform",
        },
      ],
    },
    {
      id: "cloud",
      name: "Cloud & DevOps",
      icon: Cloud,
      color: "from-orange-400 to-orange-600",
      skills: [
        { id: "aws", name: "AWS", description: "Amazon Web Services" },
        {
          id: "azure",
          name: "Azure",
          description: "Microsoft's cloud platform",
        },
        {
          id: "gcp",
          name: "Google Cloud",
          description: "Google's cloud services",
        },
        {
          id: "docker",
          name: "Docker",
          description: "Containerization platform",
        },
        {
          id: "kubernetes",
          name: "Kubernetes",
          description: "Container orchestration",
        },
        {
          id: "terraform",
          name: "Terraform",
          description: "Infrastructure as code",
        },
        { id: "jenkins", name: "Jenkins", description: "CI/CD automation" },
        { id: "gitlab", name: "GitLab CI", description: "DevOps platform" },
      ],
    },
    {
      id: "data",
      name: "Data & Analytics",
      icon: Cpu,
      color: "from-pink-400 to-pink-600",
      skills: [
        { id: "sql", name: "SQL", description: "Database query language" },
        { id: "mongodb", name: "MongoDB", description: "NoSQL database" },
        {
          id: "postgresql",
          name: "PostgreSQL",
          description: "Relational database",
        },
        { id: "redis", name: "Redis", description: "In-memory data store" },
        {
          id: "elasticsearch",
          name: "Elasticsearch",
          description: "Search and analytics",
        },
        {
          id: "spark",
          name: "Apache Spark",
          description: "Big data processing",
        },
        { id: "hadoop", name: "Hadoop", description: "Big data framework" },
        {
          id: "tensorflow",
          name: "TensorFlow",
          description: "Machine learning",
        },
      ],
    },
    {
      id: "security",
      name: "Security",
      icon: Shield,
      color: "from-red-400 to-red-600",
      skills: [
        { id: "owasp", name: "OWASP", description: "Web security standards" },
        {
          id: "penetration",
          name: "Penetration Testing",
          description: "Security assessment",
        },
        {
          id: "cryptography",
          name: "Cryptography",
          description: "Data encryption",
        },
        { id: "oauth", name: "OAuth", description: "Authentication protocol" },
        { id: "jwt", name: "JWT", description: "Token-based authentication" },
        { id: "ssl", name: "SSL/TLS", description: "Secure communication" },
      ],
    },
  ];

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

  const toggleSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const handleStartInterview = async () => {
    if (selectedSkills.length === 0 || !experienceLevel) {
      alert("Please select at least one skill and your experience level.");
      return;
    }

    setIsLoading(true);

    try {
      // Create skill-based session with backend
      const response = await fetch("http://localhost:3000/skill-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: selectedSkills,
          experience: parseInt(experienceLevel.split("-")[0]) || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sessionResponse = await response.json();

      // Store session data and navigate to interview
      localStorage.setItem("skillSessionData", JSON.stringify(sessionResponse));
      localStorage.setItem("selectedSkills", JSON.stringify(selectedSkills));
      localStorage.setItem("experienceLevel", experienceLevel);

      // Navigate to the interview page
      navigate("/interview-session", {
        state: {
          type: "skill",
          sessionData: sessionResponse,
          selectedSkills: selectedSkills,
          experienceLevel: experienceLevel,
        },
      });
    } catch (error) {
      console.error("Error starting skill interview:", error);
      alert("Failed to start skill interview. Please try again.");
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
              Skill-Based
            </span>
            <br />
            <span className="text-gray-700">Interview Practice</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose your technical skills and experience level to get
            personalized interview questions
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
                      Targeted Questions
                    </h4>
                    <p className="text-sm text-gray-600">
                      Questions focused on your selected technical skills
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Skill Assessment
                    </h4>
                    <p className="text-sm text-gray-600">
                      Detailed evaluation of your technical proficiency
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
                      Monitor your improvement across different skills
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">Selected Skills</h3>
              <div className="space-y-2">
                {selectedSkills.length === 0 ? (
                  <p className="text-sm opacity-90">No skills selected yet</p>
                ) : (
                  selectedSkills.map((skillId) => {
                    // Find the skill name from all categories
                    let skillName = skillId;
                    skillCategories.forEach((category) => {
                      const skill = category.skills.find(
                        (s) => s.id === skillId
                      );
                      if (skill) skillName = skill.name;
                    });
                    return (
                      <div
                        key={skillId}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{skillName}</span>
                      </div>
                    );
                  })
                )}
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
                      Skill-Based Interview
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Select Your Skills
                    </span>
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Choose the technical skills you want to be assessed on
                  </p>
                </div>

                {/* Skill Categories */}
                <div className="space-y-6 mb-8">
                  {skillCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className="border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex items-center mb-4">
                          <div
                            className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mr-3`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category.name}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {category.skills.map((skill) => (
                            <button
                              key={skill.id}
                              onClick={() => toggleSkill(skill.id)}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                selectedSkills.includes(skill.id)
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="font-medium text-sm">
                                {skill.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {skill.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Experience Level */}
                <div className="space-y-4 mb-8">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-lg border border-blue-100">
                    <Brain className="w-4 h-4 text-blue-600" />
                    Experience Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {experienceOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setExperienceLevel(option.value)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center group ${
                          experienceLevel === option.value
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700 shadow-xl transform scale-105"
                            : "border-gray-200/50 hover:border-blue-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-lg hover:scale-105"
                        }`}
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
                        {experienceLevel === option.value && (
                          <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleStartInterview}
                    disabled={
                      isLoading ||
                      selectedSkills.length === 0 ||
                      !experienceLevel
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
                          Start Skill Interview
                        </span>
                        <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSelection;
