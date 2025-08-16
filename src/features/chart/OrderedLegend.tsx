import type { ChartRow } from "../../types";

export default function OrderedLegend({ items }: { items: ChartRow[] }) {
  return (
    <ul className="m-0 list-none p-0 text-sm">
      {items.map((d) => (
        <li key={d.id} className="mr-4 mb-1 inline-flex items-center">
          <span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ background: d.color }} aria-hidden />
          <span>{d.name}</span>
        </li>
      ))}
    </ul>
  );
}