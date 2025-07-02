import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Plus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { accountsApi, transactionsApi } from '../services/api';
import { Account, AccountStatistics, TransactionStatistics } from '../types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountStats, setAccountStats] = useState<AccountStatistics | null>(null);
  const [transactionStats, setTransactionStats] = useState<TransactionStatistics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        accountsData,
        accountStatsData,
        transactionStatsData,
        recentTransactionsData
      ] = await Promise.all([
        accountsApi.getAll(),
        accountsApi.getStatistics(),
        transactionsApi.getStatistics(),
        transactionsApi.getAll()
      ]);

      setAccounts(accountsData);
      setAccountStats(accountStatsData);
      setTransactionStats(transactionStatsData);
      setRecentTransactions(recentTransactionsData.slice(0, 5));
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Crédito':
        return <ArrowUpRight className="h-4 w-4 text-success-600" />;
      case 'Débito':
        return <ArrowDownRight className="h-4 w-4 text-danger-600" />;
      case 'Transferência':
        return <ArrowUpRight className="h-4 w-4 text-primary-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
          data-testid="loading-spinner"
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/accounts/new"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Link>
          <Link
            to="/transactions/new"
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Saldo Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {accountStats ? formatCurrency(accountStats.totalBalance) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total de Contas</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {accountStats ? accountStats.totalAccounts : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total de Transações</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {transactionStats ? transactionStats.totalTransactions : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Valor Total</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {transactionStats ? formatCurrency(transactionStats.totalAmount) : 'R$ 0,00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas */}
        <div className="card bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contas</h2>
            <Link to="/accounts" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 5).map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{account.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{account.type}</p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-300 text-center py-4">Nenhuma conta cadastrada</p>
            )}
          </div>
        </div>

        {/* Transações Recentes */}
        <div className="card bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transações Recentes</h2>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center">
                  {getTransactionIcon(transaction.type)}
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{transaction.account.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'Crédito' ? 'text-success-600' : 
                    transaction.type === 'Débito' ? 'text-danger-600' : 'text-primary-600'
                  }`}>
                    {transaction.type === 'Débito' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {new Date(transaction.transactionDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-gray-500 dark:text-gray-300 text-center py-4">Nenhuma transação encontrada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 