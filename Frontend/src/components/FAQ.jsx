import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How accurate is the AI feedback?",
      answer:
        "Our AI has been trained on thousands of real interview scenarios and provides highly accurate feedback on communication skills, content quality, and overall performance. The system continuously learns and improves to provide more precise insights.",
    },
    {
      question: "Can I practice for technical roles?",
      answer:
        "Absolutely! IntervueAI supports technical interviews across multiple domains including software engineering, data science, product management, and more. We provide coding challenges, system design questions, and role-specific technical assessments.",
    },
    {
      question: "Is there a free version available?",
      answer:
        "Yes, we offer a free plan that includes 3 mock interviews per month with basic AI feedback. This is perfect for getting started and experiencing our platform before upgrading to unlock unlimited interviews and advanced features.",
    },
    {
      question: "What types of interviews can I practice?",
      answer:
        "You can practice behavioral interviews, technical interviews, case studies, situational questions, and industry-specific scenarios. Our platform covers interviews for various roles including software engineering, marketing, sales, consulting, and more.",
    },
    {
      question: "How does the AI interviewer work?",
      answer:
        "Our AI interviewer uses advanced natural language processing to conduct realistic interviews. It asks follow-up questions based on your responses, provides realistic scenarios, and adapts the difficulty level based on your performance and experience level.",
    },
    {
      question: "Can I use this on mobile devices?",
      answer:
        "Yes, IntervueAI is fully responsive and works seamlessly on all devices including smartphones, tablets, and desktops. You can practice interviews anywhere, anytime with the same high-quality experience.",
    },
    {
      question: "How long are the mock interview sessions?",
      answer:
        "Interview sessions typically range from 15-60 minutes depending on the type and your preferences. You can customize the duration and choose between quick practice sessions or comprehensive full-length interviews.",
    },
    {
      question: "Do you offer team or enterprise plans?",
      answer:
        "Yes, we offer enterprise solutions for companies, universities, and career centers. These plans include team management, bulk licensing, custom branding, and dedicated support. Contact our sales team for custom pricing.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Have questions? We've got answers. Can't find what you're looking
            for? Contact our support team.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp size={24} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-400" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Contact Support
            </button>
            <button className="border border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
