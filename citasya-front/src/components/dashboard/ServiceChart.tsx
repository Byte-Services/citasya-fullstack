import React from 'react';

interface ServicesChartProps {
    startDate: string;
    endDate: string;
}

type ChartDataItem = {
    label: string;
    value: number;
    color: string;
};

export const ServicesChart: React.FC<ServicesChartProps> = ({ startDate, endDate }) => {
    const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const fetchChartData = async () => {
            if (!startDate || !endDate) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/dashboard/dashboard-services?startDate=${startDate}&endDate=${endDate}`);
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data = await response.json();
                setChartData(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, [startDate, endDate]);

    if (loading) {
        return (
            <div className="text-center py-8 text-neutral-500">
                Cargando gráfico...
            </div>
        );
    }
    
    if (chartData.length === 0) {
        return (
            <div className="rounded-lg shadow-md" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <h2 className="p-6 text-md font-medium text-left mb-4 bg-neutral-100 text-neutral-700 rounded-t-lg">
                    Servicios más agendados
                </h2>
                <div className="flex flex-col items-center p-6 text-neutral-500">
                    No hay datos de servicios en este período.
                </div>
            </div>
        );
    }

    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    const radius = 40;
    const strokeWidth = 10;
    const center = 50;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = chartData.map((d, index) => {
        if (total === 0) return null;

        const dash = (d.value / total) * circumference;
        const segment = (
            <circle
                key={d.label}
                r={radius}
                cx={center}
                cy={center}
                fill="transparent"
                stroke={d.color}
                strokeWidth={strokeWidth}
                strokeDasharray={index === chartData.length - 1 ? `${circumference - offset} ${circumference}` : `${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 0.3s' }}
            />
        );
        offset += dash; 
        return segment;
    });

    return (
        <div className="rounded-lg shadow-md" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <h2 className="p-6 text-md font-medium text-left mb-4 bg-neutral-100 text-neutral-700 rounded-t-lg">
                Servicios más agendados
            </h2>
            <div className="flex flex-col items-center p-6">
                <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg width="180" height="180" viewBox="0 0 100 100" className="absolute">
                        {segments}
                        <circle
                            r={radius - strokeWidth / 2}
                            cx={center}
                            cy={center}
                            fill="#fff"
                            stroke="#fff"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
                <div className="flex justify-center items-center gap-8 mt-4">
                    {chartData.map((d) => (
                        <div key={d.label} className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded" style={{ backgroundColor: d.color }}></div>
                            <span className="text-sm text-neutral-700">{d.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between w-full px-16 mt-6">
                    {chartData.map((d) => (
                        <div key={d.label} className="flex flex-col items-center">
                            <span className="text-2xl font-bold" style={{ color: d.color }}>
                                {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
                            </span>
                            <span className="text-sm text-neutral-600 mt-1">{d.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};