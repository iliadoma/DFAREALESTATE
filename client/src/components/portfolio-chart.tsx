import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Token } from "@db/schema";

type PortfolioChartProps = {
  portfolio: Token[];
};

export default function PortfolioChart({ portfolio }: PortfolioChartProps) {
  const data = useMemo(() => {
    const investmentTotals = portfolio.reduce((acc, token) => {
      const value = Number(token.purchasePrice) * token.amount;
      const existing = acc.find((i) => i.investmentId === token.investmentId);
      
      if (existing) {
        existing.value += value;
      } else {
        acc.push({
          investmentId: token.investmentId,
          name: `Investment ${token.investmentId}`,
          value,
        });
      }
      
      return acc;
    }, [] as Array<{ investmentId: number; name: string; value: number; }>);

    return investmentTotals.sort((a, b) => b.value - a.value);
  }, [portfolio]);

  if (portfolio.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        No investments yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
          style={{ fontSize: "0.75rem" }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          width={45}
          style={{ fontSize: "0.75rem" }}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Value"]}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            fontSize: "0.875rem",
          }}
        />
        <Bar
          dataKey="value"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
