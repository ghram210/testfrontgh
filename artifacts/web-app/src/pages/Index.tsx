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

  // Default charts from the requested image
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

  // Group chart data by chart_key, preserving insertion order so the
  // dashboard mirrors whatever donut definitions exist in the chart_data
  // table without us having to hardcode keys here.
  const groupedCharts = chartData.reduce((acc, item) => {
    if (!acc[item.chart_key]) {
      acc[item.chart_key] = { title: item.chart_title, data: [] };
    }
    acc[item.chart_key].data.push({
      name: item.segment_name,
      value: item.segment_value,
      color: item.segment_color,
    });
    return acc;
  }, { ...defaultCharts } as Record<string, { title: string; data: { name: string; value: number; color: string }[] }>);

  const chartList = Object.values(groupedCharts);

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
            {chartList.map((chart, i) => (
              <DonutChart key={i} title={chart.title} data={chart.data} />
            ))}
            <ReviewStatusCard />
          </div>
          <ScannedAssetsTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
