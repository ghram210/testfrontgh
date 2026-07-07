import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const severityColorMap: Record<string, { color: string; border: string }> = {
  INFO: { color: "text-severity-info", border: "border-severity-info/30" },
  LOW: { color: "text-severity-low", border: "border-severity-low/30" },
  MEDIUM: { color: "text-severity-medium", border: "border-severity-medium/30" },
  HIGH: { color: "text-severity-high", border: "border-severity-high/30" },
  CRITICAL: { color: "text-severity-critical", border: "border-severity-critical/30" },
};

const DEFAULT_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

const SeverityCards = () => {
  const { data: stats = [] } = useQuery({
    queryKey: ["severity_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("severity_stats")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Merge database stats with default placeholders to ensure all 5 cards always show
  const mergedStats = DEFAULT_SEVERITIES.map((label) => {
    const dbStat = stats.find(
      (s) => s.label === label || (label === "INFO" && s.label === "VERY LOW")
    );
    return {
      label: label,
      value: dbStat?.value ?? 0,
      id: dbStat?.id ?? label,
    };
  });

  return (
    <div className="grid grid-cols-5 gap-4">
      {mergedStats.map((s) => {
        const colors = severityColorMap[s.label] || { color: "text-foreground", border: "border-border" };
        const displayLabel = s.label.charAt(0) + s.label.slice(1).toLowerCase();

        return (
          <div key={s.id} className={`bg-card rounded-lg p-4 border-l-2 ${colors.border}`}>
            <p className="text-xs text-muted-foreground font-medium tracking-wider mb-1">
              {displayLabel}
            </p>
            <p className={`text-2xl font-bold ${colors.color}`}>{s.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SeverityCards;
