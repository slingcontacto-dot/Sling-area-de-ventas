import React, { useMemo } from 'react';
import { SalesStat } from '../types';
import { TrendingUp, HelpCircle, Trophy, Sparkles, Star, Medal, Target, Award } from 'lucide-react';

interface StatsViewProps {
  stats: SalesStat[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const TIERS = [
    { range: '0', percentage: '0%' },
    { range: '1 - 4', percentage: '10%' },
    { range: '5 - 9', percentage: '15%' },
    { range: '10 - 14', percentage: '20%' },
    { range: '15 o más', percentage: '25%' },
  ];

  // Ordenar estadísticas por cantidad de ventas (Ranking)
  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => b.salesCount - a.salesCount);
  }, [stats]);

  const topPerformer = sortedStats[0] || null;

  // Frase motivadora dinámica para el líder
  const motivationalMessage = useMemo(() => {
    if (!topPerformer || topPerformer.salesCount === 0) return "¡El podio está vacío! Sé el primero en marcar la diferencia hoy.";
    
    const phrases = [
      `¡Atención equipo! ${topPerformer.name} lidera el ranking con ${topPerformer.salesCount} registros. ¡Imparable!`,
      `${topPerformer.name} está marcando el camino con ${topPerformer.salesCount} visitas. ¡Ese es el ritmo de Sling!`,
      `¡Récord actual! ${topPerformer.name} es nuestro MVP con ${topPerformer.salesCount} registros. ¡A por más!`,
      `${topPerformer.name}, tu liderazgo con ${topPerformer.salesCount} visitas inspira a todo el equipo.`,
      `¡El número 1 hoy! ${topPerformer.name} encabeza el podio. ¡Excelente trabajo de campo!`
    ];
    
    const index = (topPerformer.salesCount + topPerformer.name.length) % phrases.length;
    return phrases[index];
  }, [topPerformer]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Medal className="text-yellow-500" size={20} />;
      case 1: return <Medal className="text-gray-400" size={20} />;
      case 2: return <Medal className="text-amber-600" size={20} />;
      default: return <span className="text-gray-400 font-bold text-xs">{index + 1}º</span>;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-400 ring-opacity-50';
      case 1: return 'bg-gray-50 border-gray-200';
      case 2: return 'bg-orange-50 border-orange-200';
      default: return 'bg-white border-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
      {/* Tablero de Posiciones Principal */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Banner Motivador Superior */}
        {topPerformer && topPerformer.salesCount > 0 && (
          <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:rotate-12 transition-transform duration-700">
              <Trophy size={140} />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner">
                <Trophy className="text-yellow-400 animate-bounce" size={40} />
              </div>
              <div>
                <h4 className="font-black text-2xl mb-1 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  LÍDER DEL EQUIPO
                  <Sparkles size={20} className="text-yellow-300 fill-yellow-300" />
                </h4>
                <p className="text-blue-100 text-lg leading-relaxed italic font-medium max-w-md">
                  "{motivationalMessage}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Posiciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Tabla de Posiciones</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Ranking en tiempo real</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              <Award size={14} />
              {stats.length} VENDEDORES
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Puesto</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendedor</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Registros</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Comisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedStats.length > 0 ? (
                  sortedStats.map((stat, index) => (
                    <tr 
                      key={stat.name} 
                      className={`transition-all hover:bg-gray-50/80 ${index < 3 ? 'font-bold' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${getRankStyle(index)}`}>
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            index === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stat.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-800 text-sm">{stat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg text-sm ${
                          stat.salesCount > 0 ? 'bg-blue-50 text-blue-700 font-black' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {stat.salesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm ${
                          stat.commissionPercentage >= 20 ? 'text-green-600 font-black' : 
                          stat.commissionPercentage >= 10 ? 'text-blue-600 font-bold' : 'text-gray-500'
                        }`}>
                          {stat.commissionPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                      No hay datos suficientes para generar el ranking.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Panel Lateral: Referencia y Escalas */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="font-black text-gray-800 uppercase tracking-tighter">Escala de Comisiones</h3>
          </div>
          
          <div className="space-y-2">
            {TIERS.map((tier, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-blue-200 hover:bg-white transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    idx === TIERS.length - 1 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600 font-semibold">{tier.range} registros</span>
                </div>
                <span className={`text-sm font-black ${
                  idx === TIERS.length - 1 ? 'text-green-600' : 'text-gray-900'
                }`}>{tier.percentage}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-indigo-200/50">
               <Sparkles size={60} />
            </div>
            <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-3 tracking-widest relative z-10">Meta del mes</h4>
            <p className="text-sm text-indigo-900 leading-relaxed font-medium relative z-10">
              Superar los <span className="font-black text-indigo-700">15 registros</span> te garantiza el máximo de comisión (25%). ¡No te detengas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};