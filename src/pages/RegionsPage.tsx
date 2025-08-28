import React, { useState } from 'react';
import { MapPin, TrendingUp, ShoppingCart, DollarSign, Award } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useRegionsData, useRegionsMetrics, RegionPerformance } from '../hooks/useRegionsData';
import { formatCurrency, formatNumber } from '../lib/format';

export const RegionsPage: React.FC = () => {
  const { data: regionsData, isLoading, error, refetch } = useRegionsData();
  const { data: metrics } = useRegionsMetrics();
  const [sortBy, setSortBy] = useState<keyof RegionPerformance>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof RegionPerformance) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!regionsData) return [];
    
    return [...regionsData].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal, 'ru') 
          : bVal.localeCompare(aVal, 'ru');
      }
      
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [regionsData, sortBy, sortOrder]);

  const getSortIcon = (column: keyof RegionPerformance) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  const statsConfig = [
    {
      title: 'Всего регионов',
      icon: <MapPin className="w-5 h-5" />,
      value: metrics?.totalRegions,
      format: 'number' as const,
    },
    {
      title: 'Общая выручка',
      icon: <DollarSign className="w-5 h-5" />,
      value: metrics?.totalRevenue,
      format: 'currency' as const,
    },
    {
      title: 'Общие продажи',
      icon: <ShoppingCart className="w-5 h-5" />,
      value: metrics?.totalUnits,
      format: 'number' as const,
    },
    {
      title: 'Лидер по выручке',
      icon: <Award className="w-5 h-5" />,
      value: metrics?.topRegionRevenue,
      format: 'currency' as const,
      subtitle: metrics?.topRegion,
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">По регионам</h1>
          <p className="text-gray-600 mt-1">
            Анализ продаж по регионам
          </p>
        </div>
        <ErrorMessage message="Не удалось загрузить данные по регионам" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">По регионам</h1>
        <p className="text-gray-600 mt-1">
          Анализ продаж по регионам с детализацией метрик
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat) => (
          <div key={stat.title}>
            <StatCard
              title={stat.title}
              value={stat.value ?? null}
              format={stat.format}
              icon={stat.icon}
              loading={!metrics}
            />
            {stat.subtitle && (
              <div className="mt-1 text-xs text-gray-500 text-center">
                {stat.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Regions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Топ регионов по эффективности
          </h2>
          <p className="text-sm text-gray-600">
            Отсортировано по убыванию выручки
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('region')}
                  >
                    <div className="flex items-center gap-1">
                      Регион
                      <span className="text-xs">{getSortIcon('region')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('orders')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Заказы
                      <span className="text-xs">{getSortIcon('orders')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('units')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Единицы
                      <span className="text-xs">{getSortIcon('units')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('gmv')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      GMV
                      <span className="text-xs">{getSortIcon('gmv')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('revenue')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Выручка
                      <span className="text-xs">{getSortIcon('revenue')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('netProfit')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Прибыль
                      <span className="text-xs">{getSortIcon('netProfit')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('avgOrderValue')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Ср. чек
                      <span className="text-xs">{getSortIcon('avgOrderValue')}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Нет данных по регионам за выбранный период
                    </td>
                  </tr>
                ) : (
                  sortedData.map((region, index) => (
                    <tr key={region.region} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {region.region}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(region.orders)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatNumber(region.units)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(region.gmv)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {formatCurrency(region.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={region.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(region.netProfit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(region.avgOrderValue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};