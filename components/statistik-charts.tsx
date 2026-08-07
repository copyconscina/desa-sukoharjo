"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const PENDIDIKAN_COLORS = ["#8b4226", "#b0623d", "#d8a83a", "#8ba368", "#4d6b40", "#212f1c"];
const PEKERJAAN_COLORS = ["#39542f", "#4d6b40", "#8ba368", "#c3d19f", "#d8a83a", "#b0623d", "#8b4226"];

type PendidikanItem = { name: string; count: number };
type PekerjaanItem = { name: string; count: number; pct: number };

export function PendidikanDonut({ data }: { data: PendidikanItem[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-[180px] h-[180px] shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={PENDIDIKAN_COLORS[idx % PENDIDIKAN_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toLocaleString("id-ID")} Jiwa`, ""]}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-[color:var(--forest-deep)]">{total.toLocaleString("id-ID")}</span>
          <span className="text-[10px] text-[color:var(--ink-soft)] uppercase font-mono">Total</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 w-full">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PENDIDIKAN_COLORS[idx % PENDIDIKAN_COLORS.length] }} />
              <span className="text-sm text-[color:var(--ink)] truncate">{item.name}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-[color:var(--ink-soft)]">{item.count.toLocaleString("id-ID")}</span>
              <span className="text-xs font-mono text-[color:var(--clay)] ml-1.5">{((item.count / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PekerjaanDonut({ data }: { data: PekerjaanItem[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-[180px] h-[180px] shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={PEKERJAAN_COLORS[idx % PEKERJAAN_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
            formatter={(value) => [`${Number(value ?? 0).toLocaleString("id-ID")} Jiwa`, ""]}
            contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-[color:var(--forest-deep)]">{total.toLocaleString("id-ID")}</span>
          <span className="text-[10px] text-[color:var(--ink-soft)] uppercase font-mono">Total</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 w-full">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PEKERJAAN_COLORS[idx % PEKERJAAN_COLORS.length] }} />
              <span className="text-sm text-[color:var(--ink)] truncate">{item.name}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-[color:var(--ink-soft)]">{item.count.toLocaleString("id-ID")}</span>
              <span className="text-xs font-mono text-[color:var(--clay)] ml-1.5">{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}