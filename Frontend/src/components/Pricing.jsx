import React from "react";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with interview practice",
      features: [
        "3 mock interviews per month",
        "Basic AI feedback",
        "Common interview questions",
        "Email support",
        "Progress tracking",
      ],
      cta: "Get Started Free",
      popular: false,
      color: "gray",
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description:
        "Everything you need for comprehensive interview preparation",
      features: [
        "Unlimited mock interviews",
        "Advanced AI feedback & analysis",
        "Industry-specific questions",
        "Video response analysis",
        "Detailed performance reports",
        "Priority support",
        "Custom interview scenarios",
        "Progress analytics dashboard",
      ],
      cta: "Start Free Trial",
      popular: true,
      color: "blue",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "per organization",
      description: "Tailored solutions for teams and educational institutions",
      features: [
        "Everything in Pro",
        "Team management dashboard",
        "Bulk user management",
        "Custom branding",
        "Advanced analytics & reporting",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
      color: "purple",
    },
  ];

  const getColorClasses = (color, popular) => {
    if (popular) {
      return {
        border: "border-blue-500 ring-2 ring-blue-200",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        badge: "bg-blue-500",
      };
    }

    const colors = {
      gray: {
        border: "border-gray-200",
        button: "bg-gray-900 hover:bg-gray-800 text-white",
        badge: "bg-gray-500",
      },
      purple: {
        border: "border-purple-200",
        button: "bg-purple-600 hover:bg-purple-700 text-white",
        badge: "bg-purple-500",
      },
    };

    return colors[color] || colors.gray;
  };

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start with our free plan and upgrade as you grow. All plans include
            our core AI-powered interview practice features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => {
            const colorClasses = getColorClasses(plan.color, plan.popular);

            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
                  colorClasses.border
                } ${
                  plan.popular ? "transform scale-105" : "hover:-translate-y-2"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div
                      className={`${colorClasses.badge} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1`}
                    >
                      <Star size={14} fill="currentColor" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-gray-500 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check size={12} className="text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${colorClasses.button}`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            ✨ All plans include a <strong>7-day free trial</strong> • No credit
            card required
          </p>
          <p className="text-sm text-gray-500">
            Have questions?{" "}
            <a
              href="#contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact our sales team
            </a>{" "}
            for personalized recommendations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
