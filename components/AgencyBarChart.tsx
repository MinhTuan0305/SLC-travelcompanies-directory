"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { head_office_county: string; count: number }[];
}

export default function AgencyBarChart({ data }: Props) {
  return (
    <div className="w-full h-96 bg-white shadow rounded-2xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="head_office_county" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3182CE" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
