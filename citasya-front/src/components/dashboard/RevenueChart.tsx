// components/dashboard/RevenueChart.tsx
"use client";
import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface RevenueData {
  date: string; // "YYYY-MM-DD" o "HH:MM"
  total: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
    value: number;
    name: string;
    payload: RevenueData;
    }>;
    label?: string;
}



export function RevenueChart({ startDate, endDate }: { startDate: string; endDate: string; }) {
  const [data, setData] = React.useState<RevenueData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const sameDay = React.useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    return s.toDateString() === e.toDateString();
  }, [startDate, endDate]);

  React.useEffect(() => {
    let mounted = true;
    const fetchRevenue = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/dashboard/dashboard-revenue?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        );
        const json = await res.json();
        console.log("📊 Ingresos:", json);

        if (!res.ok) {
          setError(json?.message || "Error al obtener ingresos");
          setData([]);
          return;
        }

        const arr = Array.isArray(json) ? json : json.data || [];
        const normalized: RevenueData[] = arr.map((it: { date: string; total?: number; totalAmount?: number }) => ({
          date: String(it.date),
          total: Number(it.total ?? it.totalAmount ?? 0),
        }));

        // ordenar por fecha/hora si no llega ordenado
        normalized.sort((a, b) => {
          if (sameDay) return a.date.localeCompare(b.date); // "HH:MM"
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        if (mounted) setData(normalized);
      } catch (err) {
        console.error("Error al cargar ingresos", err);
        if (mounted) {
          setError("Error al cargar ingresos");
          setData([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRevenue();
    return () => { mounted = false; };
  }, [startDate, endDate, sameDay]);

  if (loading) return <p className="text-sm text-gray-500 p-4">Cargando ingresos...</p>;
  if (error) return <p className="text-sm text-red-500 p-4">{error}</p>;
  if (data.length === 0) return <p className="text-sm text-gray-500 p-4">No hay ingresos en este período.</p>;

    const xTickFormatter = (val: string) => {
    if (sameDay) return val; // "HH:MM"

    try {
        const [year, month, day] = val.split("-");
        const d = new Date(Number(year), Number(month) - 1, Number(day));

        return new Intl.DateTimeFormat("es-VE", {
        timeZone: "America/Caracas",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        }).format(d); // => "27/09/2025"
    } catch {
        return val;
    }
    };


    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const total = payload[0].value;

    // label = "YYYY-MM-DD"
    let fecha = label ?? "";
    try {
        const [year, month, day] = (label ?? "").split("-");
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        fecha = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {}

    return (
        <div className="bg-white p-2 rounded shadow text-xs">
        <p>{fecha}</p>
        <p>
            {total.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </p>
        </div>
    );
    };





  return (
    <div className="w-full h-82 p-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 20, left: 20, bottom: 20 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={xTickFormatter} />
          <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="total" fill="#447F98" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
