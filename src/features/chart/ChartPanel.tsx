import type { ChartRow } from "../../types";
import RangeBar from "../range/RangeBar";
import TimePie from "./TimePie";

type RangeKind = "day" | "week" | "month" | "year" | "life";

type Props = {
  // range controls
  rangeKind: RangeKind;
  anchor: number;
  label: string;
  onChangeKind: (k: RangeKind) => void;
  onChangeAnchor: (ts: number) => void;
  onOpenLife: () => void;

  // chart data & behavior
  data: ChartRow[];
  chartTotal: number;
  showMinutes: boolean;
  showPercentTooltip: boolean;
  onSliceClick: (row: {
    id: string;
    name: string;
    isUntracked?: boolean;
    isFuture?: boolean;
  }) => void;

  // footer stats
  trackedPastMin: number;
  totalWindowMin: number;
  trackedLabel: string;
  totalLabel: string;
};

export default function ChartPanel({
  rangeKind,
  anchor,
  label,
  onChangeKind,
  onChangeAnchor,
  onOpenLife,

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
      <RangeBar
        rangeKind={rangeKind}
        anchor={anchor}
        label={label}
        onChangeKind={onChangeKind}
        onChangeAnchor={onChangeAnchor}
        onOpenLife={onOpenLife}
      />

      <TimePie
        data={data}
        chartTotal={chartTotal}
        showMinutes={showMinutes}
        showPercentTooltip={showPercentTooltip}
        onSliceClick={onSliceClick}
        trackedPastMin={trackedPastMin}
        totalWindowMin={totalWindowMin}
        trackedLabel={trackedLabel}
        totalLabel={totalLabel}
      />
    </>
  );
}