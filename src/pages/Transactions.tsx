import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Receipt,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight
} from 'lucide-react';
import { transactionsApi, accountsApi } from '../services/api';
import { Transaction, Account } from '../types';
import toast from 'react-hot-toast';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
    // eslint-disable-next-line
  }, [transactions, searchTerm, filterAccount, filterType, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData] = await Promise.all([
        transactionsApi.getAll(),
        accountsApi.getAll()
      ]);
      setTransactions(transactionsData);
      setAccounts(accountsData);
    } catch (error) {
      toast.error('Erro ao carregar transações');
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por conta
    if (filterAccount) {
      filtered = filtered.filter(transaction => 
        transaction.account.id === parseInt(filterAccount)
      );
    }

    // Filtrar por tipo
    if (filterType) {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Filtrar por data
    if (startDate) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.transactionDate) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.transactionDate) <= new Date(endDate)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      await transactionsApi.delete(id);
      toast.success('Transação excluída com sucesso');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir transação');
      console.error('Erro ao excluir transação:', error);
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
        return <ArrowLeftRight className="h-4 w-4 text-primary-600" />;
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Crédito':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'Débito':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200';
      case 'Transferência':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transações</h1>
        <div className="flex space-x-3">
          <Link
            to="/transfer"
            className="btn-secondary flex items-center"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Transferência
          </Link>
          <Link
            to="/transactions/new"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              />
            </div>
          </div>
          <div>
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
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
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            >
              <option value="">Todos os tipos</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Transferência">Transferência</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Conta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </div>
                        {transaction.type === 'Transferência' && transaction.destinationAccount && (
                          <div className="text-xs text-gray-500 dark:text-gray-300">
                            Para: {transaction.destinationAccount.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {transaction.account.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {transaction.account.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${transaction.type === 'Crédito' ? 'text-success-600 dark:text-success-400' : transaction.type === 'Débito' ? 'text-danger-600 dark:text-danger-400' : 'text-primary-600 dark:text-primary-400'}`}>
                      {transaction.type === 'Crédito' ? '+' : transaction.type === 'Débito' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {new Date(transaction.transactionDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/transactions/${transaction.id}/edit`} className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 mr-4">
                      <Edit className="h-4 w-4 inline" />
                    </Link>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-danger-600 dark:text-danger-400 hover:text-danger-900 dark:hover:text-danger-200"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {transactions.length === 0 ? 'Nenhuma transação encontrada' : 'Nenhuma transação corresponde aos filtros'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {transactions.length === 0 
                ? 'Comece registrando sua primeira transação.' 
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
            {transactions.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/transactions/new"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar primeira transação
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions; 