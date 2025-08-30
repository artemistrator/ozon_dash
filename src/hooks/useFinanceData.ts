import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useFilters } from './useFilters';
import { formatMoscowDate } from '../lib/date-utils';
import { toNumber } from '../lib/format';

export interface FinanceCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinanceSummary {
  sales: number;
  commissions: number;
  delivery: number;
  returns: number;
  ads: number;
  services: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

const CATEGORY_COLORS = {
  sales: '#10b981',     // green
  commissions: '#ef4444', // red
  delivery: '#f59e0b',    // amber
  returns: '#8b5cf6',     // violet
  ads: '#06b6d4',         // cyan
  services: '#84cc16',    // lime
};

const CATEGORY_LABELS = {
  sales: 'Продажи',
  commissions: 'Комиссии',
  delivery: 'Доставка',
  returns: 'Возвраты',
  ads: 'Реклама',
  services: 'Услуги',
};

export const useFinanceData = () => {
  const { filters } = useFilters();
  
  return useQuery({
    queryKey: ['finance', filters],
    queryFn: async () => {
      // Get revenue data from postings table
      let revenueQuery = supabase
        .from('postings')
        .select('price, qty, payout, commission_product, raw')
        .neq('status', 'cancelled');
      
      // Apply date filtering based on dateType using raw JSON data
      const dateColumn = filters.dateType;
      const startDate = formatMoscowDate(filters.dateFrom);
      const endDate = formatMoscowDate(filters.dateTo);
      
      if (filters.sku) {
        revenueQuery = revenueQuery.eq('sku', parseInt(filters.sku));
      }
      
      const { data: revenueData, error: revenueError } = await revenueQuery;
      if (revenueError) throw revenueError;
      
      // Filter by date using raw JSON data and calculate totals
      const filteredData = (revenueData || []).filter(item => {
        if (!item.raw) return false;
        const dateValue = item.raw[dateColumn];
        if (!dateValue) return false;
        const itemDate = new Date(dateValue).toISOString().split('T')[0];
        return itemDate >= startDate && itemDate <= endDate;
      });
      
      // Get service costs from transactions table
      const { data: serviceData, error: serviceError } = await supabase
        .from('transactions')
        .select('amount, operation_type_name')
        .gte('operation_date', startDate)
        .lte('operation_date', endDate);
        
      if (serviceError) throw serviceError;
      
      // Calculate summary from real data
      const totalRevenue = filteredData.reduce((sum, item) => {
        return sum + (toNumber(item.price) * (item.qty || 1));
      }, 0);
      
      const totalPayout = filteredData.reduce((sum, item) => {
        return sum + toNumber(item.payout);
      }, 0);
      
      const totalCommissions = filteredData.reduce((sum, item) => {
        return sum + Math.abs(toNumber(item.commission_product));
      }, 0);
      
      // Calculate service costs by category
      let deliveryCosts = 0;
      let otherServiceCosts = 0;
      
      (serviceData || []).forEach(item => {
        const amount = Math.abs(toNumber(item.amount));
        if (item.operation_type_name?.toLowerCase().includes('delivery') || 
            item.operation_type_name?.includes('доставка')) {
          deliveryCosts += amount;
        } else {
          otherServiceCosts += amount;
        }
      });
      
      const summary: FinanceSummary = {
        sales: totalRevenue,
        commissions: totalCommissions,
        delivery: deliveryCosts,
        returns: 0, // No returns data in current structure
        ads: 0, // No ads data in current structure
        services: otherServiceCosts,
        totalIncome: totalRevenue,
        totalExpenses: totalCommissions + deliveryCosts + otherServiceCosts,
        netProfit: totalPayout,
      };

      // Create categories array for pie chart (excluding zero values)
      const categories: FinanceCategory[] = [];
      const total = summary.totalIncome + summary.totalExpenses;
      
      Object.entries(summary).forEach(([key, value]) => {
        if (key in CATEGORY_COLORS && value > 0) {
          const amount = key === 'sales' ? value : Math.abs(value);
          categories.push({
            category: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS],
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS],
          });
        }
      });

      return {
        summary,
        categories: categories.sort((a, b) => b.amount - a.amount),
      };
    },
    enabled: !!filters.dateFrom && !!filters.dateTo,
  });
};

export const useFinanceBreakdown = () => {
  const { filters } = useFilters();
  
  return useQuery({
    queryKey: ['financeBreakdown', filters],
    queryFn: async () => {
      // Get financial breakdown from transactions table
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('operation_date', formatMoscowDate(filters.dateFrom))
        .lte('operation_date', formatMoscowDate(filters.dateTo))
        .order('operation_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;

      return (data || []).map(item => ({
        date_msk: formatMoscowDate(new Date(item.operation_date)),
        posting_number: item.posting_number || 'N/A',
        sales: 0, // No sales data in transactions
        commissions: 0,
        delivery: item.operation_type_name?.toLowerCase().includes('delivery') ? Math.abs(toNumber(item.amount)) : 0,
        returns: 0,
        ads: 0,
        services: !item.operation_type_name?.toLowerCase().includes('delivery') ? Math.abs(toNumber(item.amount)) : 0,
        net_profit: toNumber(item.amount) || 0,
        operation_type: item.operation_type_name,
      }));
    },
    enabled: !!filters.dateFrom && !!filters.dateTo,
  });
};