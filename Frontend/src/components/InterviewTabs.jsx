import React from "react";
import { Briefcase, BookOpen } from "lucide-react";

const InterviewTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "job",
      label: "Job",
      icon: Briefcase,
      description: "Role-based interview questions",
    },
    {
      id: "skill",
      label: "Skill",
      icon: BookOpen,
      description: "Technical skill assessment",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-12">
      {/* Enhanced Tab Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
        <div className="flex justify-center gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-4 px-8 py-5 rounded-2xl font-bold text-lg
                  transition-all duration-500 transform hover:scale-105 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 hover:from-gray-100 hover:to-gray-200 hover:text-gray-800 shadow-lg hover:shadow-xl"
                  }
                `}
              >
                {/* Active tab glow effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-50 -z-10"></div>
                )}

                <div
                  className={`
                  p-2 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-200 group-hover:bg-gray-300"
                  }
                `}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>

                <span className="relative z-10">{tab.label}</span>

                {/* Hover indicator */}
                {!isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 group-hover:w-8"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Enhanced Tab Description */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full border border-blue-100">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <p className="text-gray-700 font-medium">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewTabs;
