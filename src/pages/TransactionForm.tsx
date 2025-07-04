import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { transactionsApi, accountsApi } from '../services/api';
import { CreateTransactionData, UpdateTransactionData, Account } from '../types';
import toast from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';

const TransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formError, setFormError] = useState(''); // Estado para mensagem de erro

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CreateTransactionData>();

  const isEditing = Boolean(id);

  useEffect(() => {
    loadAccounts();
    if (isEditing && id) {
      loadTransaction(parseInt(id));
    }
    // eslint-disable-next-line
  }, [isEditing, id]);

  const loadAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (error) {
      toast.error('Erro ao carregar contas');
      console.error('Erro ao carregar contas:', error);
    }
  };

  const loadTransaction = async (transactionId: number) => {
    try {
      setLoading(true);
      const data = await transactionsApi.getById(transactionId);
      setValue('type', data.type);
      setValue('amount', data.amount);
      setValue('description', data.description);
      setValue('accountId', data.account.id);
      setValue('transactionDate', data.transactionDate.split('T')[0]);
    } catch (error) {
      toast.error('Erro ao carregar transação');
      console.error('Erro ao carregar transação:', error);
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateTransactionData) => {
    try {
      setLoading(true);
      setFormError(''); // Limpa erro anterior
      if (isEditing && id) {
        const updateData: UpdateTransactionData = {
          amount: data.amount,
          description: data.description,
          transactionDate: data.transactionDate
        };
        await transactionsApi.update(parseInt(id), updateData);
        toast.success('Transação atualizada com sucesso');
      } else {
        await transactionsApi.create(data);
        toast.success('Transação criada com sucesso');
      }
      navigate('/transactions');
    } catch (error: any) {
      // Verifica se o erro é de saldo insuficiente
      const msg = error?.response?.data?.message || error?.message || '';
      if (msg.toLowerCase().includes('saldo insuficiente')) {
        setFormError('Saldo insuficiente para realizar esta transação.');
      } else {
        setFormError(isEditing ? 'Erro ao atualizar transação.' : 'Saldo insuficiente para realizar esta transação.');
      }
      toast.error(isEditing ? 'Erro ao atualizar transação' : 'Saldo insuficiente para realizar esta transação.');
      console.error('Erro ao salvar transação:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/transactions')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo da Transação */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tipo da Transação *
            </label>
            <select
              id="type"
              {...register('type', { required: 'Tipo é obrigatório' })}
              disabled={isEditing}
              className={`input-field bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-700 ${isEditing ? 'opacity-70 cursor-not-allowed' : ''} ${errors.type ? 'border-danger-500' : ''}`}
            >
              <option value="">Selecione um tipo</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              {/* <option value="Transferência">Transferência</option> */}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-danger-600">{errors.type.message}</p>
            )}
            {isEditing && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                O tipo da transação não pode ser alterado após a criação
              </p>
            )}
          </div>

          {/* Conta */}
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Conta *
            </label>
            <select
              id="accountId"
              {...register('accountId', { 
                required: 'Conta é obrigatória',
                valueAsNumber: true
              })}
              className={`input-field bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.accountId ? 'border-danger-500' : ''}`}
              disabled={isEditing}
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.type}) - {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(account.balance)}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-sm text-danger-600">{errors.accountId.message}</p>
            )}
            {isEditing && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                A conta não pode ser alterada após a criação
              </p>
            )}
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Valor *
            </label>
            <NumericFormat
              id="amount"
              thousandSeparator="."
              decimalSeparator="," 
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              className={`input-field bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.amount ? 'border-danger-500' : ''}`}
              placeholder="0,00"
              value={watch('amount') ?? ''}
              onValueChange={(values) => {
                setValue('amount', values.floatValue || 0);
              }}
              onBlur={() => {
                // Para disparar validação ao sair do campo
                setValue('amount', watch('amount'), { shouldValidate: true });
              }}
              disabled={loading}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
            )}
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
              className={`input-field bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.description ? 'border-danger-500' : ''}`}
              placeholder="Ex: Pagamento de conta de luz"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
            )}
          </div>

          {/* Data da Transação */}
          <div>
            <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Data da Transação *
            </label>
            <input
              type="date"
              id="transactionDate"
              {...register('transactionDate', { 
                required: 'Data da transação é obrigatória' 
              })}
              className={`input-field bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.transactionDate ? 'border-danger-500' : ''}`}
            />
            {errors.transactionDate && (
              <p className="mt-1 text-sm text-danger-600">{errors.transactionDate.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Atualizar' : 'Criar'} Transação
            </button>
          </div>
        </form>
        {/* Exibe mensagem de erro abaixo do formulário, se houver */}
        {formError && (
          <p className="text-danger-600 text-center mt-4" data-testid="form-error">{formError}</p>
        )}
      </div>
    </div>
  );
};

export default TransactionForm; 