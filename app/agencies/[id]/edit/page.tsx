// app/agencies/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminRoute from "@/components/AdminRoute";

export default function EditAgencyPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id); // ép sang number

  const [formData, setFormData] = useState({
    companyName: "",
    sector: "",
    county: "",
    address: "",
    size: "",
    otherStores: "",
    geographicSpecialisation: "",
    destinationsSelling: "",
    atolNumber: "",
    companyProfile: "",
    linkToWebsite: "", // ✅ thêm field mới
  });

  const [loading, setLoading] = useState(true);

  // Fetch data để prefill
  useEffect(() => {
    const fetchAgency = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("uk_agency")
        .select("*")
        .eq("ID", id)
        .single();

      if (error) {
        console.error("Error fetching agency:", error.message);
        return;
      }

      if (data) {
        setFormData({
          companyName: data["Company name"] || "",
          sector: data["SECTOR"] || "",
          county: data["Head Office COUNTY"] || "",
          address: data["Address"] || "",
          size: data["SIZE (BASED ON STAFF NUMBER)"] || "",
          otherStores: data["Other Store Locations (UK)"] || "",
          geographicSpecialisation: data["Geographic Specialisation"] || "",
          destinationsSelling: data["Destinations Selling (Country / Continent)"] || "",
          atolNumber: data["ATOL Number"] || "",
          companyProfile: data["Company profile/ About Us"] || "",
          linkToWebsite: data["Link to website"] || "", // ✅ prefill
        });
      }
      setLoading(false);
    };

    fetchAgency();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      alert("Invalid ID");
      return;
    }

    const payload = {
      "Company name": formData.companyName,
      SECTOR: formData.sector,
      "Head Office COUNTY": formData.county,
      Address: formData.address,
      "SIZE (BASED ON STAFF NUMBER)": formData.size,
      "Other Store Locations (UK)": formData.otherStores,
      "Geographic Specialisation": formData.geographicSpecialisation,
      "Destinations Selling (Country / Continent)": formData.destinationsSelling,
      "ATOL Number": formData.atolNumber,
      "Company profile/ About Us": formData.companyProfile,
      "Link to website": formData.linkToWebsite, // ✅ update luôn
    };

    const { error } = await supabase.from("uk_agency").update(payload).eq("ID", id);

    if (error) {
      console.error("Update failed:", error.message);
      alert("Update failed: " + error.message);
    } else {
      alert("Agency updated successfully!");
      router.push(`/agencies/${id}`);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <AdminRoute>
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Agency</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="companyName"
          placeholder="Agency Name"
          className="w-full border p-2 rounded"
          value={formData.companyName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="sector"
          placeholder="Sector"
          className="w-full border p-2 rounded"
          value={formData.sector}
          onChange={handleChange}
        />
        <input
          type="text"
          name="county"
          placeholder="County"
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
          name="size"
          placeholder="Size"
          className="w-full border p-2 rounded"
          value={formData.size}
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
          name="geographicSpecialisation"
          placeholder="Geographic Specialisation"
          className="w-full border p-2 rounded"
          value={formData.geographicSpecialisation}
          onChange={handleChange}
        />
        <input
          type="text"
          name="destinationsSelling"
          placeholder="Destinations Selling (Country / Continent)"
          className="w-full border p-2 rounded"
          value={formData.destinationsSelling}
          onChange={handleChange}
        />
        <input
          type="text"
          name="atolNumber"
          placeholder="ATOL Number"
          className="w-full border p-2 rounded"
          value={formData.atolNumber}
          onChange={handleChange}
        />
        <input
          type="text"
          name="linkToWebsite"
          placeholder="Link to Website"
          className="w-full border p-2 rounded"
          value={formData.linkToWebsite}
          onChange={handleChange}
        />
        <textarea
          name="companyProfile"
          placeholder="Company profile / About Us"
          className="w-full border p-2 rounded"
          rows={4}
          value={formData.companyProfile}
          onChange={handleChange}
        />

        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push(`/agencies/${id}`)}
            className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </AdminRoute>
  );
}
