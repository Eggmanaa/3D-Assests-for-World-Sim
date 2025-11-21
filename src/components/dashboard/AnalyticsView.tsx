import React, { useMemo } from 'react';
import { BarChart, PieChart, TrendingUp, Users, FlaskConical, Star } from 'lucide-react';

interface AnalyticsViewProps {
    students: any[];
    periodName: string;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ students, periodName }) => {
    const analytics = useMemo(() => {
        let totalPop = 0;
        let totalScience = 0;
        let totalFaith = 0;
        let maxPop = 0;
        let maxScience = 0;

        const civCounts: Record<string, number> = {};
        const studentStats = students.map(s => {
            let stats = { population: 0, science: 0, faith: 0, civ: 'Unknown' };
            if (s.game_state) {
                try {
                    const gs = JSON.parse(s.game_state);
                    if (gs.civilization) {
                        stats.civ = gs.civilization.name || 'Unknown';
                        if (gs.civilization.stats) {
                            stats.population = gs.civilization.stats.population || 0;
                            stats.science = gs.civilization.stats.science || 0;
                            stats.faith = gs.civilization.stats.faith || 0;
                        }
                    }
                } catch (e) { }
            }

            totalPop += stats.population;
            totalScience += stats.science;
            totalFaith += stats.faith;
            maxPop = Math.max(maxPop, stats.population);
            maxScience = Math.max(maxScience, stats.science);

            civCounts[stats.civ] = (civCounts[stats.civ] || 0) + 1;

            return { name: s.name, ...stats };
        });

        const count = students.length || 1; // Avoid division by zero

        return {
            avgPop: Math.round(totalPop / count),
            avgScience: Math.round(totalScience / count),
            avgFaith: Math.round(totalFaith / count),
            maxPop,
            maxScience,
            civCounts,
            studentStats: studentStats.sort((a, b) => b.population - a.population)
        };
    }, [students]);

    // Simple CSS Bar Chart Component
    const BarChartRow = ({ label, value, max, color }: { label: string, value: number, max: number, color: string }) => {
        const percentage = max > 0 ? (value / max) * 100 : 0;
        return (
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-500">{value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full ${color}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <BarChart className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Class Analytics</h2>
                    <p className="text-slate-500 text-sm">Performance metrics for {periodName}</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Avg. Population</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{analytics.avgPop.toLocaleString()}</div>
                    <div className="text-xs text-green-600 mt-1 font-medium">
                        Top: {analytics.maxPop.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <FlaskConical className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Avg. Science</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{analytics.avgScience}</div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                        Top: {analytics.maxScience}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <Star className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Avg. Faith</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{analytics.avgFaith}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Population Leaderboard */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Population Leaders
                    </h3>
                    <div className="space-y-1">
                        {analytics.studentStats.slice(0, 5).map((stat, i) => (
                            <BarChartRow
                                key={i}
                                label={`${stat.name} (${stat.civ})`}
                                value={stat.population}
                                max={analytics.maxPop}
                                color="bg-green-500"
                            />
                        ))}
                        {analytics.studentStats.length === 0 && (
                            <div className="text-slate-400 text-sm italic">No data available</div>
                        )}
                    </div>
                </div>

                {/* Civilization Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-slate-400" />
                        Civilization Distribution
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(analytics.civCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([civ, count], i) => (
                                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                                    <span className="text-sm font-medium text-slate-700">{civ}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-900">{count}</span>
                                        <span className="text-xs text-slate-400">({Math.round(count / students.length * 100)}%)</span>
                                    </div>
                                </div>
                            ))}
                        {Object.keys(analytics.civCounts).length === 0 && (
                            <div className="text-slate-400 text-sm italic">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
