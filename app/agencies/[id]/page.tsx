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

    // Remove debug logs for better performance

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