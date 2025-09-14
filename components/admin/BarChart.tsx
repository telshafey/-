import React from 'react';

interface ChartData {
    label: string;
    value: number;
    color: string;
}

interface BarChartProps {
    title: string;
    data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md h-full">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    لا توجد بيانات لعرضها.
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const chartHeight = 250;
    const barWidth = 40;
    const barMargin = 20;
    const chartWidth = data.length * (barWidth + barMargin);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
            <div className="overflow-x-auto">
                <svg width={chartWidth} height={chartHeight + 40} className="font-sans">
                    <g transform="translate(0, 10)">
                        {data.map((d, i) => {
                            const barHeight = (d.value / maxValue) * chartHeight;
                            const x = i * (barWidth + barMargin);
                            const y = chartHeight - barHeight;

                            return (
                                <g key={d.label}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={d.color}
                                        rx="4"
                                        ry="4"
                                    />
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 8}
                                        textAnchor="middle"
                                        className="font-bold fill-current text-gray-700 text-sm"
                                    >
                                        {d.value}
                                    </text>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight + 20}
                                        textAnchor="middle"
                                        className="fill-current text-gray-500 text-xs font-semibold"
                                    >
                                        {d.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default BarChart;