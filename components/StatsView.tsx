import React, { useMemo, useState } from 'react';
import { SalesStat } from '../types';
import { TrendingUp, Trophy, Sparkles, Medal, Target, Award, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatsViewProps {
  stats: SalesStat[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  const TIERS = [
    { range: '0 - 45', percentage: '0%' },
    { range: '45 - 59', percentage: '10%' },
    { range: '60 o más', percentage: '25%' },
  ];

  const sortedStats = useMemo(() => {
    return [...stats].sort((a, b) => b.salesCount - a.salesCount);
  }, [stats]);

  const topPerformer = sortedStats[0] || null;

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
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group border border-white/10">
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
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              <Users size={14} />
              {stats.length} VENDEDORES
            </div>
          </div>

          <div className="overflow-x-auto overflow-visible">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Puesto</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendedor</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Registros</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Contactados</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Comisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedStats.length > 0 ? (
                  sortedStats.map((stat, index) => (
                    <tr 
                      key={stat.name} 
                      className={`transition-all hover:bg-gray-50/80 group ${index < 3 ? 'font-bold' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${getRankStyle(index)}`}>
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <div 
                          className="flex items-center gap-3 cursor-help py-1 group/name"
                          onMouseEnter={() => setHoveredUser(stat.name)}
                          onMouseLeave={() => setHoveredUser(null)}
                          onClick={() => setHoveredUser(hoveredUser === stat.name ? null : stat.name)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            index === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stat.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-800 text-sm border-b border-transparent group-hover/name:border-indigo-400 transition-colors">
                            {stat.name}
                          </span>

                          {/* Tooltip de Desglose */}
                          {hoveredUser === stat.name && (
                            <div className="absolute left-full top-0 ml-4 z-[100] animate-fade-in">
                                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 w-48 pointer-events-none">
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/10">
                                        Desglose de {stat.name}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                                                <CheckCircle size={14} /> Vendidos
                                            </div>
                                            <span className="text-xs font-black">{stat.vendidoCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                                                <XCircle size={14} /> Rechazados
                                            </div>
                                            <span className="text-xs font-black">{stat.rechazadoCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-yellow-400 font-bold">
                                                <Clock size={14} /> Pendientes
                                            </div>
                                            <span className="text-xs font-black">{stat.pendienteCount}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Total Visitas</span>
                                        <span className="text-xs font-black text-indigo-300">{stat.salesCount}</span>
                                    </div>
                                </div>
                                <div className="absolute left-[-6px] top-6 w-3 h-3 bg-slate-900 rotate-45 border-l border-b border-white/10"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg text-sm ${
                          stat.salesCount > 0 ? 'bg-blue-50 text-blue-700 font-black border border-blue-100' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {stat.salesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg text-sm ${
                          stat.contactedCount > 0 ? 'bg-indigo-50 text-indigo-700 font-black border border-indigo-100' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {stat.contactedCount}
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
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
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

          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-indigo-200/50">
               <Sparkles size={60} />
            </div>
            <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-3 tracking-widest relative z-10">Meta del mes</h4>
            <p className="text-sm text-indigo-900 leading-relaxed font-medium relative z-10">
              Superar los <span className="font-black text-indigo-700">60 registros</span> te garantiza el máximo de comisión (25%). ¡No te detengas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};