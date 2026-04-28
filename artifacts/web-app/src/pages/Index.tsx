import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import FilterBar from "@/components/FilterBar";
import SeverityCards from "@/components/SeverityCards";
import DonutChart from "@/components/DonutChart";
import ReviewStatusCard from "@/components/ReviewStatusCard";
import ScannedAssetsTable from "@/components/ScannedAssetsTable";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: chartData = [] } = useQuery({
    queryKey: ["chart_data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_data")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Default charts definitions
  const defaultCharts: Record<string, { title: string; data: { name: string; value: number; color: string }[] }> = {
    exploit_availability: {
      title: "Exploit Availability",
      data: [
        { name: "Actively Used", value: 3, color: "hsl(var(--severity-critical))" },
        { name: "Available", value: 15, color: "hsl(var(--severity-high))" },
        { name: "None", value: 45, color: "hsl(var(--severity-low))" },
      ],
    },
    vulns_by_status: {
      title: "Vulnerabilities by status",
      data: [
        { name: "Open", value: 12, color: "hsl(var(--severity-critical))" },
        { name: "In Progress", value: 5, color: "hsl(var(--chart-medium))" },
        { name: "Closed", value: 8, color: "hsl(var(--severity-low))" },
      ],
    },
    vulns_by_severity: {
      title: "Vulnerabilities by Severity",
      data: [
        { name: "Critical", value: 2, color: "hsl(var(--severity-critical))" },
        { name: "High", value: 4, color: "hsl(var(--severity-high))" },
        { name: "Medium", value: 0, color: "hsl(var(--severity-medium))" },
        { name: "Low", value: 0, color: "hsl(var(--severity-low))" },
        { name: "Info", value: 0, color: "hsl(var(--severity-info))" },
      ],
    },
  };

  // Group chart data by chart_key
  const groupedCharts = chartData.reduce((acc, item) => {
    if (!acc[item.chart_key]) {
      acc[item.chart_key] = { title: item.chart_title, data: [] };
    }
    // Check if segment already exists to avoid duplication if merging with defaults
    const exists = acc[item.chart_key].data.some(d => d.name === item.segment_name);
    if (!exists) {
      acc[item.chart_key].data.push({
        name: item.segment_name,
        value: item.segment_value,
        color: item.segment_color,
      });
    } else {
      // Update value if it exists
      const idx = acc[item.chart_key].data.findIndex(d => d.name === item.segment_name);
      acc[item.chart_key].data[idx].value = item.segment_value;
    }
    return acc;
  }, JSON.parse(JSON.stringify(defaultCharts)) as Record<string, { title: string; data: { name: string; value: number; color: string }[] }>);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activePage="dashboard"
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <FilterBar />
          <SeverityCards />
          <div className="grid grid-cols-2 gap-4">
            <DonutChart
              title={groupedCharts.exploit_availability.title}
              data={groupedCharts.exploit_availability.data}
            />
            <DonutChart
              title={groupedCharts.vulns_by_status.title}
              data={groupedCharts.vulns_by_status.data}
            />
            <DonutChart
              title={groupedCharts.vulns_by_severity.title}
              data={groupedCharts.vulns_by_severity.data}
            />
            <ReviewStatusCard />

            {/* Any other dynamic charts from the database */}
            {Object.entries(groupedCharts)
              .filter(([key]) => !['exploit_availability', 'vulns_by_status', 'vulns_by_severity'].includes(key))
              .map(([key, chart]) => (
                <DonutChart key={key} title={chart.title} data={chart.data} />
              ))
            }
          </div>
          <ScannedAssetsTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
