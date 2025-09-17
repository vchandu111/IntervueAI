import React from "react";
import {
  Bot,
  BarChart3,
  Settings,
  TrendingUp,
  MessageCircle,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Mock Interviews",
      description:
        "Practice with realistic AI-driven interviewers that adapt to your responses and provide human-like conversation.",
      color: "blue",
    },
    {
      icon: BarChart3,
      title: "Instant Feedback & Scoring",
      description:
        "Get detailed analysis of your performance with actionable insights to identify strengths and areas for improvement.",
      color: "green",
    },
    {
      icon: Settings,
      title: "Customizable Interview Experience",
      description:
        "Choose from various roles, industries, difficulty levels, and interview types to match your career goals.",
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking & Analytics",
      description:
        "Monitor your improvement over time with comprehensive analytics and performance metrics.",
      color: "orange",
    },
    {
      icon: MessageCircle,
      title: "Multi-Format Practice",
      description:
        "Practice behavioral, technical, case study, and situational interviews across different formats.",
      color: "indigo",
    },
    {
      icon: Award,
      title: "Industry-Specific Preparation",
      description:
        "Access tailored interview questions and scenarios for your specific industry and role level.",
      color: "emerald",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      indigo: "from-indigo-500 to-indigo-600",
      emerald: "from-emerald-500 to-emerald-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform provides all the tools and insights you
            need to master any interview and land your dream job with
            confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${getColorClasses(
                    feature.color
                  )} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to experience the future of interview preparation?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have already improved their
              interview skills with IntervueAI.
            </p>
            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
