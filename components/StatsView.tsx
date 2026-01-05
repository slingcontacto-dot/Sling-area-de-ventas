import React, { useMemo } from 'react';
import { SalesStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, HelpCircle, Trophy, Sparkles, Star } from 'lucide-react';

interface StatsViewProps {
  stats: SalesStat[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#d946ef'
  ];

  const TIERS = [
    { range: '0', percentage: '0%' },
    { range: '1 - 4', percentage: '10%' },
    { range: '5 - 9', percentage: '15%' },
    { range: '10 - 14', percentage: '20%' },
    { range: '15 o más', percentage: '25%' },
  ];

  // Identificar al líder absoluto
  const topPerformer = useMemo(() => {
    if (stats.length === 0) return null;
    return [...stats].sort((a, b) => b.salesCount - a.salesCount)[0];
  }, [stats]);

  // Frase motivadora dinámica
  const motivationalMessage = useMemo(() => {
    if (!topPerformer || topPerformer.salesCount === 0) return "¡Vamos equipo! Cada registro es una oportunidad de crecimiento.";
    
    const phrases = [
      `¡Atención todos! ${topPerformer.name} está imparable con ${topPerformer.salesCount} registros. ¡Ese es el nivel!`,
      `¿Vieron eso? ${topPerformer.name} lidera el tablero. ¡Tu proactividad está llevando a Sling a lo más alto!`,
      `¡Récord a la vista! ${topPerformer.name} ya suma ${topPerformer.salesCount} visitas. ¡Excelente ritmo de trabajo!`,
      `${topPerformer.name}, tu compromiso con ${topPerformer.salesCount} registros es la brújula del equipo hoy.`,
      `¡Pura eficiencia! ${topPerformer.name} encabeza la lista. ¡Sigamos este gran ejemplo de ventas!`
    ];
    
    // Selección pseudo-aleatoria basada en el total de registros para que cambie a medida que cargan
    const index = (topPerformer.salesCount + topPerformer.name.length) % phrases.length;
    return phrases[index];
  }, [topPerformer]);

  const getRowBackground = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-900';
    if (count >= 15) return 'bg-green-100 text-green-900 font-bold';
    if (count >= 5) return 'bg-green-50 text-green-800 font-medium';
    return 'bg-white text-gray-900';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <BarChart3 size={20} />
                  </span>
                  Rendimiento del Equipo
              </h2>
              <p className="text-sm text-gray-500 mt-1">Comparativa de actividad por vendedor</p>
            </div>

            <div className="h-72 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip 
                        cursor={{fill: '#f3f4f6'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="salesCount" name="Registros" radius={[6, 6, 0, 0]}>
                        {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                  </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Motivational Banner - Dinámico para el líder */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                    <Trophy size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-5">
                    <div className="hidden sm:flex bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 animate-pulse">
                        <Sparkles className="text-yellow-300" size={32} />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-xl mb-2 flex items-center gap-2">
                            Zona de Líderes
                            <Star size={20} className="fill-yellow-400 text-yellow-400" />
                        </h4>
                        <p className="text-blue-50 text-lg leading-snug italic font-medium">
                            "{motivationalMessage}"
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabla de Comisiones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Estado de Comisiones</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vendedor</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Registros</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Comisión</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat) => (
                      <tr key={stat.name} className={`${getRowBackground(stat.salesCount)} transition-all hover:bg-gray-50`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-2">
                              {topPerformer?.name === stat.name && stat.salesCount > 0 && <Trophy size={16} className="text-yellow-500 drop-shadow-sm" />}
                              {stat.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {stat.salesCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black">
                              {stat.commissionPercentage}%
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={20} className="text-blue-500" />
                <h3 className="font-bold text-gray-800">Referencia de Pagos</h3>
            </div>
            
            <div className="space-y-3">
                {TIERS.map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-sm text-gray-600 font-medium">{tier.range} registros</span>
                        <span className="text-sm font-bold text-indigo-700">{tier.percentage}</span>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 relative">
                <h4 className="text-xs font-black text-indigo-700 uppercase mb-3 tracking-wider">Tip de Ventas</h4>
                <p className="text-sm text-indigo-800 leading-relaxed">
                    "La diferencia entre un buen vendedor y uno excelente es un registro más antes de terminar el día."
                </p>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-lg shadow-lg">
                    <Sparkles size={16} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};