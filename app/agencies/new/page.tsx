"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewAgencyPage() {
  const supabase = createClient();
  const router = useRouter();

  const [sectors, setSectors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    companyName: "",
    legalName: "",
    sector: "",
    size: "",
    county: "",
    address: "",
    otherStores: "",
    geoSpec: "",
    destinations: "",
    atol: "",
    profile: "",
    website: "", // 🔹 thêm field website
  });

  // 🔹 Fetch distinct SECTOR + SIZE from DB
  useEffect(() => {
    async function fetchDropdownData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("uk_agency")
        .select("SECTOR, \"SIZE (BASED ON STAFF NUMBER)\"");

      if (error) {
        console.error("Error fetching dropdown data:", error);
      } else if (data) {
        const uniqueSectors = Array.from(
          new Set(data.map((d: any) => d.SECTOR).filter(Boolean))
        ).sort();

        const uniqueSizes = Array.from(
          new Set(data.map((d: any) => d["SIZE (BASED ON STAFF NUMBER)"]).filter(Boolean))
        ).sort();

        setSectors(uniqueSectors);
        setSizes(uniqueSizes);
      }
      setLoading(false);
    }

    fetchDropdownData();
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      "Company name": formData.companyName,
      "Legal Comapny Name (As Per Companies House)": formData.legalName,
      SECTOR: formData.sector,
      "SIZE (BASED ON STAFF NUMBER)": formData.size,
      "Head Office COUNTY": formData.county,
      Address: formData.address,
      "Other Store Locations (UK)": formData.otherStores,
      "Geographic Specialisation": formData.geoSpec,
      "Destinations Selling (Country / Continent)": formData.destinations,
      "ATOL Number": formData.atol,
      "Company profile/ About Us": formData.profile,
      "Link to website": formData.website, // 🔹 map sang cột DB
    };

    const { error } = await supabase.from("uk_agency").insert([payload]);

    if (error) {
      console.error("Error inserting agency:", error);
      alert("Insert failed: " + error.message);
    } else {
      alert("Agency added successfully!");
      router.push("/agencies");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Agency</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          className="w-full border p-2 rounded"
          value={formData.companyName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="legalName"
          placeholder="Legal Company Name (As Per Companies House)"
          className="w-full border p-2 rounded"
          value={formData.legalName}
          onChange={handleChange}
        />

        {/* 🔹 Sector Dropdown */}
        <select
          name="sector"
          className="w-full border p-2 rounded"
          value={formData.sector}
          onChange={handleChange}
          required
        >
          <option value="">{loading ? "Loading sectors..." : "Select Sector"}</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* 🔹 Size Dropdown */}
        <select
          name="size"
          className="w-full border p-2 rounded"
          value={formData.size}
          onChange={handleChange}
          required
        >
          <option value="">{loading ? "Loading sizes..." : "Select Size"}</option>
          {sizes.map((sz) => (
            <option key={sz} value={sz}>
              {sz}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="county"
          placeholder="Head Office County"
          className="w-full border p-2 rounded"
          value={formData.county}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          className="w-full border p-2 rounded"
          value={formData.address}
          onChange={handleChange}
        />

        <input
          type="text"
          name="otherStores"
          placeholder="Other Store Locations (UK)"
          className="w-full border p-2 rounded"
          value={formData.otherStores}
          onChange={handleChange}
        />

        <input
          type="text"
          name="geoSpec"
          placeholder="Geographic Specialisation"
          className="w-full border p-2 rounded"
          value={formData.geoSpec}
          onChange={handleChange}
        />

        <input
          type="text"
          name="destinations"
          placeholder="Destinations Selling (Country / Continent)"
          className="w-full border p-2 rounded"
          value={formData.destinations}
          onChange={handleChange}
        />

        <input
          type="text"
          name="atol"
          placeholder="ATOL Number"
          className="w-full border p-2 rounded"
          value={formData.atol}
          onChange={handleChange}
        />

        {/* 🔹 Website link */}
        <input
          type="url"
          name="website"
          placeholder="Website Link"
          className="w-full border p-2 rounded"
          value={formData.website}
          onChange={handleChange}
        />

        <textarea
          name="profile"
          placeholder="Company Profile / About Us"
          className="w-full border p-2 rounded"
          value={formData.profile}
          onChange={handleChange}
          rows={4}
        />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push("/agencies")}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
