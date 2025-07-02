import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { accountsApi } from '../services/api';
import { CreateAccountData, UpdateAccountData, Account } from '../types';
import toast from 'react-hot-toast';

const AccountForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CreateAccountData>();

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      loadAccount(parseInt(id));
    }
    // eslint-disable-next-line
  }, [isEditing, id]);

  const loadAccount = async (accountId: number) => {
    try {
      setLoading(true);
      const data = await accountsApi.getById(accountId);
      setAccount(data);
      setValue('name', data.name);
      setValue('type', data.type);
    } catch (error) {
      toast.error('Erro ao carregar conta');
      console.error('Erro ao carregar conta:', error);
      navigate('/accounts');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateAccountData) => {
    try {
      setLoading(true);
      
      // Garantir que initialBalance seja um número ou undefined
      const accountData = {
        ...data,
        initialBalance: data.initialBalance ? Number(data.initialBalance) : undefined
      };
      
      if (isEditing && id) {
        const updateData: UpdateAccountData = {
          name: data.name,
          type: data.type
        };
        await accountsApi.update(parseInt(id), updateData);
        toast.success('Conta atualizada com sucesso');
      } else {
        await accountsApi.create(accountData);
        toast.success('Conta criada com sucesso');
      }
      
      navigate('/accounts');
    } catch (error) {
      toast.error(isEditing ? 'Erro ao atualizar conta' : 'Erro ao criar conta');
      console.error('Erro ao salvar conta:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/accounts')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome da Conta */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Conta *
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { 
                required: 'Nome da conta é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Nome deve ter pelo menos 3 caracteres'
                }
              })}
              className={`input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.name ? 'border-danger-500' : ''}`}
              placeholder="Ex: Conta Corrente Banco X"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo da Conta */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo da Conta *
            </label>
            <select
              id="type"
              {...register('type', { 
                required: 'Tipo da conta é obrigatório' 
              })}
              className={`input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.type ? 'border-danger-500' : ''}`}
            >
              <option value="">Selecione um tipo</option>
              <option value="Corrente">Corrente</option>
              <option value="Poupança">Poupança</option>
              <option value="Crédito">Crédito</option>
              <option value="Investimento">Investimento</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.type.message}</p>
            )}
          </div>

          {/* Saldo Inicial */}
          {!isEditing && (
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saldo Inicial (opcional)
              </label>
              <input
                type="number"
                id="initialBalance"
                step="0.01"
                min="0"
                {...register('initialBalance', {
                  min: {
                    value: 0,
                    message: 'Saldo inicial deve ser maior ou igual a zero'
                  }
                })}
                className={`input-field dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 ${errors.initialBalance ? 'border-danger-500' : ''}`}
                placeholder="0,00"
              />
              {errors.initialBalance && (
                <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">{errors.initialBalance.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Deixe em branco se a conta não possui saldo inicial
              </p>
            </div>
          )}

          {/* Saldo Atual (apenas na edição) */}
          {isEditing && account && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saldo Atual
              </label>
              <div className="input-field bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(account.balance)}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                O saldo é atualizado automaticamente através das transações
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/accounts')}
              className="btn-secondary dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
              {isEditing ? 'Atualizar' : 'Criar'} Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm; 