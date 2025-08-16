import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ChartRow } from "../../types";
import OrderedLegend from "./OrderedLegend";
import { formatMinutes, formatPercent } from "../../lib/format";

type Props = {
  data: ChartRow[];
  chartTotal: number;
  showMinutes: boolean;
  showPercentTooltip: boolean;
  onSliceClick: (row: ChartRow) => void;
  trackedPastMin: number;
  totalWindowMin: number;
  trackedLabel: string;
  totalLabel: string;
};

export default function TimePie({
  data,
  chartTotal,
  showMinutes,
  showPercentTooltip,
  onSliceClick,
  trackedPastMin,
  totalWindowMin,
  trackedLabel,
  totalLabel,
}: Props) {
  return (
    <>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={1}
              isAnimationActive={false}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                  onClick={() => onSliceClick(entry)}
                />
              ))}
            </Pie>

            <Tooltip
              separator=" - "
              formatter={(v: any, _name: any, item: any) => {
                const value = Number(v);
                const base = formatMinutes(value, showMinutes);

                if (!showPercentTooltip) return base;

                // fall back to mine computed total if missing
                const p =
                  (item && (item.payload?.percent ?? item.percent)) ??
                  (chartTotal > 0 ? value / chartTotal : 0);

                return `${base} (${formatPercent(p)})`;
              }}
            />
            <Legend content={<OrderedLegend items={data} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-right text-xs text-zinc-500">
        {trackedLabel}: {formatMinutes(trackedPastMin, showMinutes)}
        {" | "}
        {totalLabel}: {formatMinutes(totalWindowMin, showMinutes)}
      </div>
    </>
  );
}