import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinanceData } from '../../hooks/useFinanceData';
import { formatCurrency, formatPercentage } from '../../lib/format';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';

export const FinancePieChart: React.FC = () => {
  const { data, isLoading, error, refetch } = useFinanceData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ErrorMessage 
          message="Не удалось загрузить финансовые данные"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!data || data.categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-12">
          Нет финансовых данных для отображения
        </div>
      </div>
    );
  }

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length > 0) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Сумма: <span className="font-medium">{formatCurrency(data.amount)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Доля: <span className="font-medium">{formatPercentage(data.percentage)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    if (entry.percentage < 5) return ''; // Hide labels for small slices
    return `${formatPercentage(entry.percentage)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Структура финансов
        </h2>
        <p className="text-sm text-gray-600">
          Распределение доходов и расходов по категориям
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.categories}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {data.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Summary */}
        <div className="space-y-4">
          {/* Categories Legend */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Категории</h3>
            {data.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(category.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(category.percentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Summary */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <h3 className="font-medium text-gray-900">Сводка</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Общий доход:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.summary.totalIncome)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Общие расходы:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(data.summary.totalExpenses)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="font-medium text-gray-900">Чистая прибыль:</span>
              <span className={`font-bold ${
                data.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(data.summary.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};