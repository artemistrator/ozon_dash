import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { FinancePieChart } from '../components/charts/FinancePieChart';
import { StatCard } from '../components/ui/StatCard';
import { useFinanceData } from '../hooks/useFinanceData';

export const FinancePage: React.FC = () => {
  const { data } = useFinanceData();

  const statsConfig = [
    {
      title: 'Общий доход',
      icon: <TrendingUp className="w-5 h-5" />,
      value: data?.summary.totalIncome,
      format: 'currency' as const,
    },
    {
      title: 'Общие расходы',
      icon: <TrendingDown className="w-5 h-5" />,
      value: data?.summary.totalExpenses,
      format: 'currency' as const,
    },
    {
      title: 'Чистая прибыль',
      icon: <DollarSign className="w-5 h-5" />,
      value: data?.summary.netProfit,
      format: 'currency' as const,
    },
    {
      title: 'Рентабельность',
      icon: <Activity className="w-5 h-5" />,
      value: data?.summary.totalIncome > 0 
        ? (data.summary.netProfit / data.summary.totalIncome) * 100
        : 0,
      format: 'percentage' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>
        <p className="text-gray-600 mt-1">
          Финансовая аналитика и распределение по категориям
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value ?? null}
            format={stat.format}
            icon={stat.icon}
            loading={!data}
          />
        ))}
      </div>

      {/* Finance Pie Chart */}
      <FinancePieChart />

      {/* Additional Financial Breakdown */}
      {data && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Детализация по категориям
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-medium text-green-800">Продажи</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0 
                }).format(data.summary.sales)}
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-medium text-red-800">Комиссии</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0 
                }).format(Math.abs(data.summary.commissions))}
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="font-medium text-amber-800">Доставка</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0 
                }).format(Math.abs(data.summary.delivery))}
              </div>
            </div>

            <div className="p-4 bg-violet-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-violet-500 rounded-full" />
                <span className="font-medium text-violet-800">Возвраты</span>
              </div>
              <div className="text-2xl font-bold text-violet-600">
                {Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0 
                }).format(Math.abs(data.summary.returns))}
              </div>
            </div>

            <div className="p-4 bg-cyan-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                <span className="font-medium text-cyan-800">Реклама</span>
              </div>
              <div className="text-2xl font-bold text-cyan-600">
                {Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0 
                }).format(Math.abs(data.summary.ads))}
              </div>
            </div>

            <div className="p-4 bg-lime-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-lime-500 rounded-full" />
                <span className="font-medium text-lime-800">Услуги</span>
              </div>
              <div className="text-2xl font-bold text-lime-600">
                {Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0 
                }).format(Math.abs(data.summary.services))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};