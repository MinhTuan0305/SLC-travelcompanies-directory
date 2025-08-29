"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddAgencyForm() {
  const supabase = createClient();
  const [form, setForm] = useState({
    company_name: "",
    sector: "",
    size: "",
    county: "",
    geo: "",
    address: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("uk_agency").insert([
      {
        "Company name": form.company_name,
        SECTOR: form.sector,
        "SIZE (BASED ON STAFF NUMBER)": form.size,
        "Head Office COUNTY": form.county,
        "Geographic Specialisation": form.geo,
        Address: form.address,
        "Link to website": form.website,
      },
    ]);

    if (error) {
      setMessage("❌ Error: " + error.message);
    } else {
      setMessage("✅ Agency added successfully!");
      setForm({
        company_name: "",
        sector: "",
        size: "",
        county: "",
        geo: "",
        address: "",
        website: "",
      });
    }
    setLoading(false);
  };

  return (
    <div className="border-4 border-green-400 rounded-lg p-6 mb-6 bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Add New Agency</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="company_name"
          placeholder="Company Name"
          value={form.company_name}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="sector"
          placeholder="Sector"
          value={form.sector}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="size"
          placeholder="Size"
          value={form.size}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="county"
          placeholder="Head Office County"
          value={form.county}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="geo"
          placeholder="Geographic Specialisation"
          value={form.geo}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="p-2 border rounded col-span-2"
        />
        <input
          type="url"
          name="website"
          placeholder="Website"
          value={form.website}
          onChange={handleChange}
          className="p-2 border rounded col-span-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Adding..." : "Add Agency"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
