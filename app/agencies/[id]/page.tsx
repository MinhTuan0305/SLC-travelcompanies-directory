// app/agencies/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import AgencyDetailClient from "@/components/AgencyDetailClient";

export default async function AgencyDetail({
  params,
}: {
  params: Promise<{ id: string }>; // Must be Promise in newer Next.js
}) {
  // Await params before accessing properties
  const resolvedParams = await params;
  const supabase = await createClient();

  // ép id từ string -> number để đúng kiểu bigint trong DB
  const agencyId = Number(resolvedParams.id);

  if (isNaN(agencyId)) {
    return <pre>Error: Invalid agency ID</pre>;
  }

  try {
    // Query Supabase theo ID
    const { data: agency, error } = await supabase
      .from("uk_agency")
      .select("*")
      .eq("ID", agencyId)
      .single();

    // THÊM DEBUG ĐỂ KIỂM TRA DỮ LIỆU
    console.log("=== DEBUG AGENCY DATA ===");
    console.log("Raw agency data:", agency);
    console.log("All keys:", agency ? Object.keys(agency) : "No agency data");
    console.log("Legal Company Name value:", agency?.["Legal Company Name (As Per Companies House)"]);
    console.log("Company name:", agency?.["Company name"]);
    console.log("=== END DEBUG ===");

    if (error || !agency) {
      return <pre>Error: {error?.message || "Agency not found"}</pre>;
    }

    // Trả về component client hiển thị chi tiết
    return <AgencyDetailClient agency={agency} />;
  } catch (err) {
    console.error("Supabase error:", err);
    return <pre>Error: Failed to fetch agency data</pre>;
  }
}