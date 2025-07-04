import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard
} from 'lucide-react';
import { transactionsApi, accountsApi } from '../services/api';
import { Transaction, Account } from '../types';
import toast from 'react-hot-toast';

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface MonthlyData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

const COLORS = {
  receitas: '#10B981',
  despesas: '#EF4444',
  transferencias: '#3B82F6',
  corrente: '#3B82F6',
  poupanca: '#10B981',
  credito: '#8B5CF6',
  investimento: '#F59E0B'
};

const Analytics: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // dias
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar contas
      const accountsData = await accountsApi.getAll();
      setAccounts(accountsData);
      
      // Preparar parâmetros de filtro para o backend
      const params: any = {};
      
      // Filtro por conta
      if (selectedAccount && selectedAccount !== '') {
        params.accountId = parseInt(selectedAccount);
      }
      
      // Filtro por período
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      params.startDate = daysAgo.toISOString().split('T')[0];
      
      // Definir data final como hoje
      const today = new Date();
      params.endDate = today.toISOString().split('T')[0];
      
      // Carregar transações com filtros aplicados pelo backend
      const transactionsData = await transactionsApi.getAll(params);
      setTransactions(transactionsData);
    } catch (error) {
      toast.error('Erro ao carregar dados para análise');
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [period, selectedAccount]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Como os filtros já são aplicados pelo backend, retornamos as transações diretamente
  const getFilteredTransactions = () => {
    return transactions;
  };

  // Dados para gráfico de pizza - Distribuição por tipo
  const getTypeDistribution = (): ChartData[] => {
    const filtered = getFilteredTransactions();
    const distribution = filtered.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, value]) => ({
      name: type,
      value: Math.abs(value),
      fill: type === 'Crédito' ? COLORS.receitas : 
            type === 'Débito' ? COLORS.despesas : 
            COLORS.transferencias
    }));
  };

  // Dados para gráfico de pizza - Distribuição por conta
  const getAccountDistribution = (): ChartData[] => {
    const filtered = getFilteredTransactions();
    const distribution = filtered.reduce((acc, transaction) => {
      acc[transaction.account.name] = (acc[transaction.account.name] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([accountName, value]) => {
      // Encontrar a conta correspondente para obter o tipo
      const account = accounts.find(acc => acc.name === accountName);
      let fillColor = COLORS.corrente;
      
      if (account) {
        switch (account.type) {
          case 'Corrente':
            fillColor = COLORS.corrente;
            break;
          case 'Poupança':
            fillColor = COLORS.poupanca;
            break;
          case 'Crédito':
            fillColor = COLORS.credito;
            break;
          case 'Investimento':
            fillColor = COLORS.investimento;
            break;
          default:
            fillColor = COLORS.corrente;
        }
      }

      return {
        name: accountName,
        value: Math.abs(value),
        fill: fillColor
      };
    });
  };

  // Dados para gráfico de barras - Receitas vs Despesas mensais
  const getMonthlyData = (): MonthlyData[] => {
    const filtered = getFilteredTransactions();
    const monthlyData: Record<string, { receitas: number; despesas: number }> = {};

    filtered.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { receitas: 0, despesas: 0 };
      }

      if (transaction.type === 'Crédito') {
        monthlyData[monthKey].receitas += transaction.amount;
      } else if (transaction.type === 'Débito') {
        monthlyData[monthKey].despesas += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.receitas - data.despesas
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  // Dados para gráfico de linha - Evolução do saldo
  const getBalanceEvolution = () => {
    const filtered = getFilteredTransactions();
    const balanceData: Record<string, number> = {};
    let currentBalance = 0;

    // Ordenar transações por data
    const sortedTransactions = filtered.sort((a, b) => 
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );

    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const dateKey = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (transaction.type === 'Crédito') {
        currentBalance += transaction.amount;
      } else if (transaction.type === 'Débito') {
        currentBalance -= transaction.amount;
      }

      balanceData[dateKey] = currentBalance;
    });

    return Object.entries(balanceData).map(([date, balance]) => ({
      date,
      balance
    }));
  };

  // Estatísticas gerais
  const getStatistics = () => {
    const filtered = getFilteredTransactions();
    const totalReceitas = filtered
      .filter(t => t.type === 'Crédito')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDespesas = filtered
      .filter(t => t.type === 'Débito')
      .reduce((sum, t) => sum + t.amount, 0);

    const saldo = totalReceitas - totalDespesas;
    const totalTransacoes = filtered.length;

    return { totalReceitas, totalDespesas, saldo, totalTransacoes };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualize seus dados financeiros com gráficos e análises
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último ano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conta
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalReceitas)}
              </p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.totalDespesas)}
              </p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo</p>
              <p className={`text-lg font-semibold ${stats.saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(stats.saldo)}
              </p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transações</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stats.totalTransacoes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receitas vs Despesas */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Receitas vs Despesas Mensais
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact',
                    maximumFractionDigits: 0
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value),
                  ''
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="receitas" fill={COLORS.receitas} name="Receitas" />
              <Bar dataKey="despesas" fill={COLORS.despesas} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição por Tipo */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Distribuição por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getTypeDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getTypeDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value),
                  'Valor'
                ]}
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Linha - Evolução do Saldo */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Evolução do Saldo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getBalanceEvolution()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact',
                    maximumFractionDigits: 0
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value),
                  'Saldo'
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke={COLORS.corrente} 
                strokeWidth={2}
                dot={{ fill: COLORS.corrente, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição por Conta */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Distribuição por Conta
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getAccountDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getAccountDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value),
                  'Valor'
                ]}
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
