// eslint-disable-next-line import/first
import '@testing-library/jest-dom';
// eslint-disable-next-line import/first
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line import/first
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line import/first
import Accounts from './Accounts';

// Mock do useNavigate para evitar navegação real
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

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

describe('Accounts', () => {
  it('deve renderizar o título da página', async () => {
    render(
      <MemoryRouter>
        <Accounts />
      </MemoryRouter>
    );
    expect(await screen.findByText(/contas/i)).toBeInTheDocument();
  });

  it('deve mostrar mensagem de nenhuma conta encontrada', async () => {
    render(
      <MemoryRouter>
        <Accounts />
      </MemoryRouter>
    );
    expect(await screen.findByText(/nenhuma conta encontrada/i)).toBeInTheDocument();
  });
}); 