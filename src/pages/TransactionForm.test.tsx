// eslint-disable-next-line import/first
import '@testing-library/jest-dom';
// eslint-disable-next-line import/first
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// eslint-disable-next-line import/first
import { MemoryRouter, Routes, Route } from 'react-router-dom';
// eslint-disable-next-line import/first
import TransactionForm from './TransactionForm';

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock das APIs
jest.mock('../services/api', () => ({
  transactionsApi: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  },
  accountsApi: {
    getAll: jest.fn(),
  }
}));

// Mock do toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock do react-number-format
jest.mock('react-number-format', () => ({
  NumericFormat: ({ onValueChange, value, ...props }: any) => {
    const { thousandSeparator, decimalSeparator, decimalScale, fixedDecimalScale, allowNegative, prefix, ...restProps } = props;
    return (
      <input
        {...restProps}
        value={value}
        onChange={(e) => onValueChange({ floatValue: parseFloat(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 })}
        data-testid="amount-input"
      />
    );
  },
}));

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (
      typeof msg === 'string' &&
      msg.includes('React Router Future Flag Warning')
    ) {
      return;
    }
    console.warn(msg);
  });
  
  // Mock do console.error para evitar mensagens nos testes
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('TransactionForm', () => {
  const mockAccounts = [
    {
      id: 1,
      name: 'Conta Corrente',
      type: 'Corrente',
      balance: 5000,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Conta Poupança',
      type: 'Poupança',
      balance: 10000,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  const mockTransaction = {
    id: 1,
    type: 'Débito',
    amount: 500,
    description: 'Pagamento de conta',
    transactionDate: '2024-01-15T00:00:00.000Z',
    account: { id: 1, name: 'Conta Corrente' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { accountsApi } = require('../services/api');
    accountsApi.getAll.mockResolvedValue(mockAccounts);
  });

  const renderTransactionForm = (path = '/transactions/new') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/transactions/new" element={<TransactionForm />} />
          <Route path="/transactions/:id/edit" element={<TransactionForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve renderizar o formulário de nova transação', async () => {
    renderTransactionForm();

    await waitFor(() => {
      expect(screen.getByText('Nova Transação')).toBeInTheDocument();
    });

    expect(screen.getByText('Tipo da Transação *')).toBeInTheDocument();
    expect(screen.getByText('Conta *')).toBeInTheDocument();
    expect(screen.getByText('Valor *')).toBeInTheDocument();
    expect(screen.getByText('Descrição *')).toBeInTheDocument();
    expect(screen.getByText('Data da Transação *')).toBeInTheDocument();
  });

  it('deve carregar e exibir as contas disponíveis', async () => {
    renderTransactionForm();

    await waitFor(() => {
      expect(screen.getByText('Conta Corrente (Corrente) - R$ 5.000,00')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Conta Poupança (Poupança) - R$ 10.000,00')).toBeInTheDocument();
    });
  });

  it('deve validar campos obrigatórios', async () => {
    renderTransactionForm();

    await waitFor(() => {
      expect(screen.getByText('Criar Transação')).toBeInTheDocument();
    });

    // Tenta submeter sem preencher campos
    const submitButton = screen.getByText('Criar Transação');
    fireEvent.click(submitButton);

    // Verifica mensagens de erro
    await waitFor(() => {
      expect(screen.getByText('Tipo da transação é obrigatório')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Conta é obrigatória')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Data da transação é obrigatória')).toBeInTheDocument();
    });
  });

  it('deve validar descrição com mínimo de caracteres', async () => {
    renderTransactionForm();

    await waitFor(() => {
      expect(screen.getByText('Criar Transação')).toBeInTheDocument();
    });

    // Preenche descrição com menos de 3 caracteres
    const descriptionInput = screen.getByLabelText('Descrição *');
    fireEvent.change(descriptionInput, { target: { value: 'ab' } });

    // Tenta submeter
    const submitButton = screen.getByText('Criar Transação');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Descrição deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    });
  });

  it('deve renderizar formulário de edição', async () => {
    const { transactionsApi } = require('../services/api');
    transactionsApi.getById.mockResolvedValue(mockTransaction);

    renderTransactionForm('/transactions/1/edit');

    await waitFor(() => {
      expect(screen.getByText('Editar Transação')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Débito')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Pagamento de conta')).toBeInTheDocument();
    });
  });

  it('deve desabilitar tipo e conta na edição', async () => {
    const { transactionsApi } = require('../services/api');
    transactionsApi.getById.mockResolvedValue(mockTransaction);

    renderTransactionForm('/transactions/1/edit');

    await waitFor(() => {
      expect(screen.getByText('Editar Transação')).toBeInTheDocument();
    });

    const typeSelect = screen.getByLabelText('Tipo da Transação *');
    const accountSelect = screen.getByLabelText('Conta *');

    expect(typeSelect).toBeDisabled();
    expect(accountSelect).toBeDisabled();
  });

  it('deve mostrar mensagens informativas na edição', async () => {
    const { transactionsApi } = require('../services/api');
    transactionsApi.getById.mockResolvedValue(mockTransaction);

    renderTransactionForm('/transactions/1/edit');

    await waitFor(() => {
      expect(screen.getByText('O tipo da transação não pode ser alterado após a criação')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('A conta não pode ser alterada após a criação')).toBeInTheDocument();
    });
  });

  it('deve lidar com erro ao carregar contas', async () => {
    const { accountsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    accountsApi.getAll.mockRejectedValue(new Error('Erro na API'));

    renderTransactionForm();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar contas');
    });
  });

  it('deve lidar com erro ao carregar transação para edição', async () => {
    const { transactionsApi } = require('../services/api');
    const toast = require('react-hot-toast');
    
    transactionsApi.getById.mockRejectedValue(new Error('Transação não encontrada'));

    renderTransactionForm('/transactions/999/edit');

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar transação');
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/transactions');
    });
  });

  it('deve navegar de volta ao clicar em cancelar', async () => {
    renderTransactionForm();

    await waitFor(() => {
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('deve navegar de volta ao clicar na seta', async () => {
    renderTransactionForm();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: '' });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('deve mostrar loading durante a edição', async () => {
    const { transactionsApi } = require('../services/api');
    
    // Mock para demorar o carregamento
    transactionsApi.getById.mockImplementation(() => new Promise(() => {}));

    renderTransactionForm('/transactions/1/edit');

    // Verifica se o loading está sendo mostrado
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
}); 