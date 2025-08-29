"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How do I search for an agency?",
    answer:
      "Go to the Agencies page and use the search bar at the top. You can type the company name or use the filters such as County, Sector, or Size. The list will update instantly with matching agencies.",
  },
  {
    question: "How can I add a new agency?",
    answer:
      "Click on 'Add New Agency' in the menu. Fill in the form with the agency’s details, including name, sector, size, county, and website link. Then click Save. The new agency will appear in the database.",
  },
  {
    question: "Can I remove or edit an agency?",
    answer:
      "At the moment, you can only add new agencies through the form. Editing or removing agencies is available in the the detail page of the company.",
  },
  {
    question: "What is shown in the Analytics page?",
    answer:
      "The Analytics page provides charts that help you understand the distribution of agencies by county, sector, and size. You can switch between viewing values in numbers or percentages.",
  },
  {
    question: "Why do I sometimes not see my changes immediately?",
    answer:
      "The list updates shortly after you add a new agency. If you do not see the change right away, please refresh the page or try again in a moment.",
  },
];

export default function HowToUsePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-800 mb-6">How to Use</h1>
      <p className="text-slate-600 mb-10">
        This website helps you explore and manage travel agencies in the UK. You
        can search and filter agencies, add new ones, and view visual insights
        through charts. Here’s how to get started:
      </p>

      {/* Instructions */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">🔍 Search for Agencies</h2>
          <p className="text-slate-600">
            On the <strong>Agencies</strong> page, use the search bar or select
            filters like County, Sector, or Size. The results will appear
            instantly based on your criteria.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">➕ Add a New Agency</h2>
          <p className="text-slate-600">
            Open the <strong>Add New Agency</strong> page, complete the form with
            the required details, and click <em>Save</em>. Your new agency will
            be added to the list shortly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">📊 View Analytics</h2>
          <p className="text-slate-600">
            Go to the <strong>Analytics</strong> page to explore charts by
            county, sector, and size. You can switch between viewing results as
            absolute numbers or percentages for better insights.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">❓ Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-slate-700"
              >
                {faq.question}
                <span>{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
