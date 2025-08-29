// src/lib/supabase/queries.ts
import { createClient } from "./client";

const supabase = createClient();

export async function getStores({
  page = 1,
  limit = 10,
  searchName = "",
  searchAddress = "",
  searchCounty = "",
}: {
  page?: number;
  limit?: number;
  searchName?: string;
  searchAddress?: string;
  searchCounty?: string;
}) {
  let query = supabase.from("store_locator").select("*", { count: "exact" });

  if (searchName) {
    query = query.ilike("Trading name", `%${searchName}%`);
  }
  if (searchAddress) {
    query = query.ilike("Head Office Address", `%${searchAddress}%`);
  }
  if (searchCounty) {
    query = query.ilike("Stores COUNTY", `%${searchCounty}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return { data, count };
}
