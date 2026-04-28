import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const severityColorMap: Record<string, { color: string; border: string; labelColor?: string }> = {
  "VERY LOW": { color: "text-[hsl(var(--chart-purple))]", border: "border-[hsl(var(--chart-purple))]/30", labelColor: "text-[hsl(var(--chart-purple))]" },
  INFO: { color: "text-[hsl(var(--chart-purple))]", border: "border-[hsl(var(--chart-purple))]/30", labelColor: "text-[hsl(var(--chart-purple))]" },
  LOW: { color: "text-severity-low", border: "border-severity-low/30" },
  MEDIUM: { color: "text-severity-medium", border: "border-severity-medium/30" },
  HIGH: { color: "text-severity-high", border: "border-severity-high/30" },
  CRITICAL: { color: "text-severity-critical", border: "border-severity-critical/30" },
};

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

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((s) => {
        const colors = severityColorMap[s.label.toUpperCase()] || { color: "text-foreground", border: "border-border" };
        const displayLabel = s.label.toUpperCase() === "VERY LOW" ? "INFO" : s.label;
        return (
          <div key={s.id} className={`bg-card rounded-lg p-4 border-l-2 ${colors.border}`}>
            <p className={`text-xs font-medium tracking-wider mb-1 ${colors.labelColor || "text-muted-foreground"}`}>
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
