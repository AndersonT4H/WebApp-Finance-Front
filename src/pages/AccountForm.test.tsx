import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountForm from './AccountForm';

jest.mock('../services/api', () => ({
  accountsApi: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue({ id: 1, name: 'Conta Teste', type: 'Corrente', balance: 0, createdAt: new Date().toISOString() }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    getStatistics: jest.fn().mockResolvedValue({}),
  }
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
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
  });



// Mock do useNavigate e useParams para evitar navegação real e simular criação
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}), // Simula criação (não edição)
}));

describe('AccountForm', () => {
  it('deve renderizar o formulário de nova conta', () => {
    render(
      <MemoryRouter>
        <AccountForm />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/nome da conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tipo da conta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('deve mostrar erro se tentar submeter sem preencher campos obrigatórios', async () => {
    render(
      <MemoryRouter>
        <AccountForm />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText(/nome da conta é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/tipo da conta é obrigatório/i)).toBeInTheDocument();
  });
}); 