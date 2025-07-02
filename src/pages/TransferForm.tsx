import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { transactionsApi, accountsApi } from '../services/api';
import { Account } from '../types';
import toast from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';

interface TransferData {
  amount: number;
  description: string;
  accountId: number;
  destinationAccountId: number;
}

const TransferForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<TransferData>();

  const accountId = watch('accountId');
  const destinationAccountId = watch('destinationAccountId');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (error) {
      toast.error('Erro ao carregar contas');
      console.error('Erro ao carregar contas:', error);
    }
  };

  const onSubmit = async (data: TransferData) => {
    if (data.accountId === data.destinationAccountId) {
      toast.error('As contas de origem e destino devem ser diferentes');
      return;
    }

    try {
      setLoading(true);
      await transactionsApi.transfer(data);
      toast.success('Transferência realizada com sucesso');
      navigate('/transactions');
    } catch (error) {
      toast.error('Erro ao realizar transferência');
      console.error('Erro ao realizar transferência:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = (accountId: number) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  function isValidNumber(value: any) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  const saldoOrigem = isValidNumber(accountId) ? getAccountBalance(accountId) : 0;
  const valorTransferencia = isValidNumber(watch('amount')) ? watch('amount') : 0;
  const saldoInsuficiente = valorTransferencia > saldoOrigem;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/transactions')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nova Transferência</h1>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Conta de Origem */}
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Conta de Origem *
            </label>
            <select
              id="accountId"
              {...register('accountId', { 
                required: 'Conta de origem é obrigatória',
                valueAsNumber: true
              })}
              className={`input-field ${errors.accountId ? 'border-danger-500' : ''} dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
            >
              <option value="">Selecione a conta de origem</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.type}) - {formatCurrency(account.balance)}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-danger-600">{errors.accountId.message}</p>
            )}
            {accountId && isValidNumber(getAccountBalance(accountId)) ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Saldo disponível: {formatCurrency(getAccountBalance(accountId))}
              </p>
            ) : null}
          </div>

          {/* Conta de Destino */}
          <div>
            <label htmlFor="destinationAccountId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Conta de Destino *
            </label>
            <select
              id="destinationAccountId"
              {...register('destinationAccountId', { 
                required: 'Conta de destino é obrigatória',
                valueAsNumber: true
              })}
              className={`input-field ${errors.destinationAccountId ? 'border-danger-500' : ''} dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
            >
              <option value="">Selecione a conta de destino</option>
              {accounts
                .filter(account => account.id !== accountId)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type}) - {formatCurrency(account.balance)}
                  </option>
                ))}
            </select>
            {errors.destinationAccountId && (
              <p className="mt-1 text-sm text-danger-600">{errors.destinationAccountId.message}</p>
            )}
            {destinationAccountId && isValidNumber(getAccountBalance(destinationAccountId)) ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Saldo atual: {formatCurrency(getAccountBalance(destinationAccountId))}
              </p>
            ) : null}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Valor da Transferência *
            </label>
            <NumericFormat
              id="amount"
              thousandSeparator="."
              decimalSeparator="," 
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              className={`input-field ${errors.amount ? 'border-danger-500' : ''} dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
              placeholder="0,00"
              value={watch('amount') ?? ''}
              onValueChange={(values: any) => setValue('amount', values.floatValue)}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
            )}
            {accountId && isValidNumber(saldoOrigem) && isValidNumber(valorTransferencia) && saldoInsuficiente ? (
              <p className="mt-1 text-sm text-danger-600 font-semibold">Saldo insuficiente para realizar a transferência</p>
            ) : null}
            {accountId && isValidNumber(saldoOrigem) && isValidNumber(valorTransferencia) && !saldoInsuficiente ? (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                Saldo após transferência: {formatCurrency(saldoOrigem - valorTransferencia)}
              </p>
            ) : null}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              id="description"
              {...register('description', { 
                required: 'Descrição é obrigatória',
                minLength: {
                  value: 3,
                  message: 'Descrição deve ter pelo menos 3 caracteres'
                }
              })}
              className={`input-field ${errors.description ? 'border-danger-500' : ''} dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
              placeholder="Ex: Transferência para poupança"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
            )}
          </div>

          {/* Resumo da Transferência */}
          {accountId && destinationAccountId && isValidNumber(getAccountBalance(accountId)) && isValidNumber(getAccountBalance(destinationAccountId)) && isValidNumber(watch('amount')) ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Resumo da Transferência</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <span className="font-medium">De:</span> {accounts.find(acc => acc.id === accountId)?.name}
                </p>
                <p>
                  <span className="font-medium">Para:</span> {accounts.find(acc => acc.id === destinationAccountId)?.name}
                </p>
                <p>
                  <span className="font-medium">Valor:</span> {formatCurrency(watch('amount') || 0)}
                </p>
                <p>
                  <span className="font-medium">Saldo após transferência:</span> {formatCurrency(getAccountBalance(accountId) - (watch('amount') || 0))}
                </p>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <ArrowLeftRight className="h-4 w-4 mr-2" />
              )}
              Realizar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm; 