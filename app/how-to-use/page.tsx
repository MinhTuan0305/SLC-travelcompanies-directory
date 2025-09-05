"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Lazy load components if any are added in the future

const faqs = [
  {
    question: "How do I search for an agency?",
    answer:
      "Go to the Agencies page and use the search bar at the top. You can type the company name, ATOL number, or use the filters such as County, Sector, or Size. The list will update instantly with matching agencies. You can also use the floating search bar that appears when you scroll down.",
  },
  {
    question: "How can I add a new agency?",
    answer:
      "Only administrators can add new agencies. Click on 'Add New Agency' in the menu (visible only to admins). Fill in the form with the agency's details, including name, sector, size, county, and website link. Then click Save. The new agency will appear in the database immediately.",
  },
  {
    question: "Can I edit or delete an agency?",
    answer:
      "Only administrators can edit or delete agencies. On the agency detail page, you'll see 'Edit' and 'Delete' buttons if you're logged in as an admin. Non-admin users will see a message asking them to log in or informing them that only admins can perform these actions.",
  },
  {
    question: "What is the Map View feature?",
    answer:
      "The Map View shows an interactive map of England with all counties highlighted. Click on any county to see agencies located in that area. The system uses fuzzy matching to find agencies even if the county names don't match exactly (e.g., 'Greater Manchester' matches 'Manchester').",
  },
  {
    question: "How do I use the News section?",
    answer:
      "The News section displays the latest industry updates and articles. Click on 'News' in the main menu to view all published articles. Click on any article to read the full content. Administrators can manage news articles through the 'Manage News' link in their user menu.",
  },
  {
    question: "What are personal notes?",
    answer:
      "Personal notes allow logged-in users to add private notes to any agency. These notes are only visible to you and help you keep track of important information about specific agencies. You can add, edit, or delete your notes from the agency detail page.",
  },
  {
    question: "What is the Store Locator?",
    answer:
      "The Store Locator helps you find agencies based on their physical locations. It provides a different way to browse agencies by their store locations across the UK.",
  },
  {
    question: "How do I become an administrator?",
    answer:
      "Administrator privileges are managed through the Supabase database. Contact the system administrator to have your account upgraded to admin status. Only admins can create, edit, or delete agencies and manage news articles.",
  },
  {
    question: "Why do I sometimes not see my changes immediately?",
    answer:
      "The list updates shortly after you add a new agency. If you do not see the change right away, please refresh the page or try again in a moment. Some changes may take a few seconds to propagate through the system.",
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
        This comprehensive platform helps you explore and manage travel agencies in the UK. 
        You can search and filter agencies, view them on an interactive map, read industry news, 
        add personal notes, and manage content (admin only). Here's how to get started:
      </p>

      {/* Instructions */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">🔍 Search for Agencies</h2>
          <p className="text-slate-600">
            On the <strong>Agencies</strong> page, use the search bar or select
            filters like County, Sector, or Size. You can search by company name, ATOL number, 
            or any other criteria. The results will appear instantly based on your criteria. 
            A floating search bar also appears when you scroll down for easy access.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">🗺️ Interactive Map View</h2>
          <p className="text-slate-600">
            Visit the <strong>Map View</strong> to explore agencies geographically. Click on any 
            county in England to see agencies located in that area. The system uses intelligent 
            fuzzy matching to find agencies even if county names don't match exactly.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">📰 Read Industry News</h2>
          <p className="text-slate-600">
            Check the <strong>News</strong> section for the latest industry updates, regulatory 
            changes, and travel trends. Click on any article to read the full content. 
            Featured articles are highlighted for important updates.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">📝 Personal Notes</h2>
          <p className="text-slate-600">
            Logged-in users can add private notes to any agency. These notes are only visible 
            to you and help you keep track of important information, contacts, or observations 
            about specific agencies. Access notes from the agency detail page.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">🏪 Store Locator</h2>
          <p className="text-slate-600">
            Use the <strong>Store Locator</strong> to find agencies based on their physical 
            locations. This provides an alternative way to browse agencies by their store 
            locations across the UK.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">👑 Admin Features</h2>
          <p className="text-slate-600">
            <strong>Administrators only:</strong> Add, edit, or delete agencies and manage news articles. 
            Admin features include the "Add New Agency" button, "Manage News" link, and edit/delete 
            buttons on agency detail pages. Non-admin users will see appropriate messages when 
            trying to access these features.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">📊 Analytics & Insights</h2>
          <p className="text-slate-600">
            Go to the <strong>Dashboard</strong> to explore charts and analytics by county, 
            sector, and size. You can switch between viewing results as absolute numbers or 
            percentages for better insights into the agency distribution.
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
