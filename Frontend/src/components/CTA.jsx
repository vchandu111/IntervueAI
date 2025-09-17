import React from "react";
import { ArrowRight, Star, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Land Your{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Dream Job?
            </span>
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of successful professionals who have mastered their
            interviews with IntervueAI. Start your journey to career success
            today.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-blue-200">
            <div className="flex items-center gap-2">
              <Users size={20} />
              <span className="text-sm">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={20} />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={20} />
              <span className="text-sm">95% Success Rate</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-white hover:bg-gray-100 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              View Pricing
              <ArrowRight size={20} />
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1">
              Schedule a Demo
            </button>
          </div>

          {/* Guarantee */}
          <p className="text-blue-200 text-sm">
            ✨ <strong>7-day free trial</strong> • No credit card required •
            Cancel anytime
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Quick Setup
            </h3>
            <p className="text-blue-200 text-sm">
              Get started in less than 2 minutes
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Instant Results
            </h3>
            <p className="text-blue-200 text-sm">
              Get feedback immediately after each session
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Career Success
            </h3>
            <p className="text-blue-200 text-sm">
              Land your dream job with confidence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
