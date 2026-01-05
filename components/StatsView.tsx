import React from 'react';
import { SalesStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, HelpCircle, Trophy, Sparkles } from 'lucide-react';

interface StatsViewProps {
  stats: SalesStat[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  // Paleta de colores ampliada para soportar más usuarios
  const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#6366f1', // Indigo
    '#d946ef', // Fuchsia
    '#14b8a6', // Teal
    '#f97316'  // Orange
  ];

  const TIERS = [
    { range: '0', percentage: '0%' },
    { range: '1 - 4', percentage: '10%' },
    { range: '5 - 9', percentage: '15%' },
    { range: '10 - 14', percentage: '20%' },
    { range: '15 o más', percentage: '25%' },
  ];

  // Encontrar al líder
  const topPerformer = stats.length > 0 
    ? [...stats].sort((a, b) => b.salesCount - a.salesCount)[0] 
    : null;

  const getMotivationalPhrase = (name: string, count: number) => {
    const phrases = [
      `¡Increíble trabajo, ${name}! Llevas la delantera con ${count} registros. Tu proactividad es el motor de este equipo.`,
      `¡Pura potencia! ${name} está dominando el tablero con ${count} visitas. ¡Sigan su ejemplo!`,
      `${name}, eres imparable. Con ${count} registros, hoy eres nuestro MVP. ¡A por más!`,
      `¡Liderazgo total! ${name} marca el ritmo hoy. ¡Gracias por tu enorme compromiso!`
    ];
    // Usar el nombre como semilla para que la frase sea consistente pero pueda variar
    const index = name.length % phrases.length;
    return phrases[index];
  };

  const getRowBackground = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-900';
    if (count >= 15) return 'bg-green-100 text-green-900';
    if (count >= 5) return 'bg-green-50 text-green-800';
    return 'bg-white text-gray-900';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Main Stats Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <BarChart3 size={20} />
                </span>
                Estadísticas de Equipo
            </h2>
            <p className="text-sm text-gray-500 mt-1">Visitas y comisiones por vendedor</p>
            </div>

            <div className="h-72 w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={stats}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="salesCount" name="Visitas" radius={[4, 4, 0, 0]}>
                    {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>

            {/* Motivational Banner */}
            {topPerformer && topPerformer.salesCount > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden group transition-all hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:rotate-12 transition-transform">
                        <Trophy size={80} />
                    </div>
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                            <Sparkles className="text-yellow-300 animate-pulse" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                                Mensaje para el Equipo
                                <Trophy size={18} className="text-yellow-400" />
                            </h4>
                            <p className="text-blue-50 leading-relaxed italic">
                                "{getMotivationalPhrase(topPerformer.name, topPerformer.salesCount)}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tabla de Comisiones</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitas a negocio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión Ganada</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat) => (
                      <tr key={stat.name} className={`${getRowBackground(stat.salesCount)} transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold flex items-center gap-2">
                              {topPerformer?.name === stat.name && stat.salesCount > 0 && <Trophy size={14} className="text-yellow-500" />}
                              {stat.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {stat.salesCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                              {stat.commissionPercentage}%
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </div>

      {/* Reference Table Side Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={20} className="text-blue-500" />
                <h3 className="font-bold text-gray-800">Escala de Referencia</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
                Porcentajes de ganancia basados en la cantidad de visitas realizadas.
            </p>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Visitas</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Comisión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {TIERS.map((tier, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 text-gray-600">{tier.range}</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-800">{tier.percentage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Tip del día</h4>
                <p className="text-xs text-blue-600">
                    "La constancia es la base de las grandes ventas. ¡Cada registro cuenta para tu bono mensual!"
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};