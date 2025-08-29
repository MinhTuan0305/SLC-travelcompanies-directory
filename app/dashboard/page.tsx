import { createClient } from "@/lib/supabase/server";
import AgencyBarChart from "@/components/AgencyBarChart";
import AgencyPieChart from "@/components/AgencyPieChart";

export const revalidate = 3600;

export default async function DashboardPage() {
  const supabase = await createClient();

  // 🔹 Fetch meaningful data only
  const { data: agencies, error } = await supabase
    .from("uk_agency")
    .select(`
      "Company name",
      "SECTOR",
      "Head Office COUNTY",
      "SIZE (BASED ON STAFF NUMBER)",
      "No. of Retail Stores",
      "Geographic Specialisation",
      "Destinations Selling (Country / Continent)"
    `);

  if (error) {
    console.error("Supabase error:", error.message);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 text-center max-w-md">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!agencies || agencies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No data found</h2>
          <p className="text-slate-600">Unable to load agency data at this time.</p>
        </div>
      </div>
    );
  }

  // 🔹 Data Processing Functions
  const processData = (field: string) => {
    const counts: Record<string, number> = {};
    agencies.forEach((agency: any) => {
      const value = agency[field]?.toString().trim() || "Unknown";
      if (value && value !== "Unknown" && value !== "N/A" && value !== "") {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // 🔹 Process meaningful data
  const countyData = processData("Head Office COUNTY");
  const sectorData = processData("SECTOR");
  const sizeData = processData("SIZE (BASED ON STAFF NUMBER)");
  const geoData = processData("Geographic Specialisation");

  // 🔹 Additional meaningful analytics
  const totalAgencies = agencies.length;
  
  // Retail stores analysis
  const retailStoresData = agencies
    .map(a => parseInt(a["No. of Retail Stores"]?.toString() || "0"))
    .filter(num => !isNaN(num) && num > 0);
  const totalRetailStores = retailStoresData.reduce((sum, num) => sum + num, 0);
  const avgRetailStores = retailStoresData.length > 0 ? Math.round(totalRetailStores / retailStoresData.length) : 0;
  const agenciesWithStores = retailStoresData.length;

  // International destinations analysis
  const withIntlDestinations = agencies.filter(a => {
    const dest = a["Destinations Selling (Country / Continent)"]?.toString().trim();
    return dest && dest !== "Unknown" && dest !== "N/A" && dest !== "";
  }).length;

  // Top performers
  const topCounty = countyData[0];
  const topSector = sectorData[0];
  const mostCommonSize = sizeData[0];

  // 🔹 Chart Component for reuse
  const ChartCard = ({ title, data, color = "blue", icon = "📊" }: {
    title: string;
    data: { name: string; count: number }[];
    color?: string;
    icon?: string;
  }) => {
    const colorClasses = {
      blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
      green: "from-green-50 to-green-100 border-green-200 text-green-700",
      purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
      orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center border`}>
            <span className="text-sm">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        
        {data.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <span className="text-2xl block mb-2">📊</span>
            <span className="text-sm">No data available</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.slice(0, 6).map((item, index) => {
              const percentage = Math.round((item.count / totalAgencies) * 100);
              return (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 w-4">#{index + 1}</span>
                    <span className="font-medium text-slate-700 text-sm truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                    <span className="text-xs text-slate-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
            {data.length > 6 && (
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">... and {data.length - 6} more</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* 🔹 Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">UK Agency Dashboard</h1>
              <p className="text-slate-600">Comprehensive analytics and insights for travel agencies</p>
            </div>
          </div>
          
          {/* 🔹 Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{totalAgencies}</div>
              <div className="text-blue-600 text-xs font-medium">Total Agencies</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-2xl font-bold text-green-700">{countyData.length}</div>
              <div className="text-green-600 text-xs font-medium">Counties</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{totalRetailStores}</div>
              <div className="text-purple-600 text-xs font-medium">Total Stores</div>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
              <div className="text-2xl font-bold text-teal-700">{withIntlDestinations}</div>
              <div className="text-teal-600 text-xs font-medium">Intl Destinations</div>
            </div>
          </div>
        </div>

        {/* 🔹 Quick Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">💡</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Key Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-100 border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">Market Leader</div>
              <div className="text-lg font-bold text-blue-900 truncate">{topCounty?.name || "N/A"}</div>
              <div className="text-xs text-blue-700">
                {topCounty ? `${topCounty.count} agencies (${Math.round((topCounty.count / totalAgencies) * 100)}%)` : "No data"}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-1">Top Sector</div>
              <div className="text-lg font-bold text-green-900 truncate">{topSector?.name || "N/A"}</div>
              <div className="text-xs text-green-700">
                {topSector ? `${topSector.count} agencies (${Math.round((topSector.count / totalAgencies) * 100)}%)` : "No data"}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-100 border border-purple-200">
              <div className="text-sm font-medium text-purple-800 mb-1">Avg Retail Stores</div>
              <div className="text-2xl font-bold text-purple-900">{avgRetailStores}</div>
              <div className="text-xs text-purple-700">{agenciesWithStores} agencies have stores</div>
            </div>
          </div>
        </div>

        {/* 🔹 Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* County Distribution */}
          <ChartCard 
            title="Agencies by County" 
            data={countyData} 
            color="blue"
            icon="📍"
          />
          
          {/* Sector Distribution */}
          <ChartCard 
            title="Agencies by Sector" 
            data={sectorData} 
            color="green"
            icon="🏢"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Company Size Distribution */}
          <ChartCard 
            title="Company Size Distribution" 
            data={sizeData} 
            color="purple"
            icon="👥"
          />
          
          {/* Geographic Specialisation */}
          <ChartCard 
            title="Geographic Specialisation" 
            data={geoData} 
            color="orange"
            icon="🌍"
          />
        </div>

        {/* 🔹 Retail Stores Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600">🏪</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Retail Presence Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{totalRetailStores}</div>
              <div className="text-slate-600 text-sm font-medium">Total Retail Stores</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{agenciesWithStores}</div>
              <div className="text-slate-600 text-sm font-medium">Agencies with Stores</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{avgRetailStores}</div>
              <div className="text-slate-600 text-sm font-medium">Avg Stores per Agency</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-bold text-slate-900">
                {Math.round((agenciesWithStores / totalAgencies) * 100)}%
              </div>
              <div className="text-slate-600 text-sm font-medium">Have Physical Stores</div>
            </div>
          </div>
        </div>

        {/* 🔹 International Reach */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <span className="text-teal-600">✈️</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800">International Market Reach</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-100 border border-teal-200">
              <div className="text-2xl font-bold text-teal-700">{withIntlDestinations}</div>
              <div className="text-teal-600 text-sm font-medium">Agencies with International Destinations</div>
              <div className="text-xs text-teal-500 mt-1">
                {Math.round((withIntlDestinations / totalAgencies) * 100)}% of total agencies
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{totalAgencies - withIntlDestinations}</div>
              <div className="text-blue-600 text-sm font-medium">UK-focused Agencies</div>
              <div className="text-xs text-blue-500 mt-1">
                {Math.round(((totalAgencies - withIntlDestinations) / totalAgencies) * 100)}% domestic focus
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Main Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-indigo-600">📈</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">County Distribution (Interactive Chart)</h2>
          </div>
          <AgencyBarChart 
            data={countyData.map(item => ({ 
              head_office_county: item.name, 
              count: item.count 
            }))} 
          />
        </div>

        {/* Pie charts: Sector & Size */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AgencyPieChart
            title="Agencies by Sector"
            data={sectorData.map(d => ({ name: d.name, value: d.count }))}
        />
        <AgencyPieChart
            title="Agencies by Company Size"
            data={sizeData.map(d => ({ name: d.name, value: d.count }))}
        />
        </div>


        {/* 🔹 Footer Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
            <span>📅</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>Data refreshed every hour</span>
          </div>
        </div>
      </div>
    </main>
  );
}