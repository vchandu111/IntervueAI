import React from "react";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individuals getting started",
      features: [
        "5 AI Interview Sessions",
        "Basic Question Bank",
        "Email Support",
        "Progress Tracking",
        "Resume Analysis",
      ],
      cta: "Get Started",
      colorClasses: {
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        border: "border-blue-200",
        badge: "bg-blue-100 text-blue-800",
      },
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Best for serious job seekers",
      features: [
        "Unlimited AI Interview Sessions",
        "Advanced Question Bank",
        "Priority Support",
        "Detailed Analytics",
        "Resume Optimization",
        "Mock Interview Scheduling",
        "Industry-Specific Questions",
      ],
      cta: "Start Free Trial",
      popular: true,
      colorClasses: {
        button: "bg-purple-600 hover:bg-purple-700 text-white",
        border: "border-purple-200",
        badge: "bg-purple-100 text-purple-800",
      },
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For teams and organizations",
      features: [
        "Everything in Professional",
        "Team Management",
        "Custom Question Banks",
        "API Access",
        "White-label Solution",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Reporting",
      ],
      cta: "Contact Sales",
      colorClasses: {
        button: "bg-gray-800 hover:bg-gray-900 text-white",
        border: "border-gray-200",
        badge: "bg-gray-100 text-gray-800",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your
            <span className="text-blue-600"> Perfect Plan</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Start your journey to interview success with our AI-powered practice
            platform
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 ${
                plan.popular
                  ? "border-purple-500 scale-105"
                  : plan.colorClasses.border
              } transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className={`w-full py-3 sm:py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${plan.colorClasses.button}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How does the AI interview work?
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your responses in real-time and provides
                personalized feedback to help you improve your interview skills.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. No long-term
                commitments required.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What types of interviews are covered?
              </h3>
              <p className="text-gray-600">
                We cover technical interviews, behavioral interviews, and
                industry-specific questions across various fields.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes, we offer a 7-day free trial for all plans so you can
                experience our platform risk-free.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
