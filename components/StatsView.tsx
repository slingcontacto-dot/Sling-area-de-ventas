import React from 'react';
import { SalesStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

interface StatsViewProps {
  stats: SalesStat[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const TIERS = [
    { range: '0', percentage: '0%' },
    { range: '1 - 4', percentage: '10%' },
    { range: '5 - 9', percentage: '15%' },
    { range: '10 - 14', percentage: '20%' },
    { range: '15 o más', percentage: '25%' },
  ];

  const getRowBackground = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-900';
    if (count >= 15) return 'bg-green-100 text-green-900';
    if (count >= 5) return 'bg-green-50 text-green-800';
    return 'bg-white text-gray-900';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Stats Area */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tabla de Comisiones</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitas a negocio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia por venta</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat) => (
                      <tr key={stat.name} className={`${getRowBackground(stat.salesCount)} transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
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
        </div>
      </div>
    </div>
  );
};