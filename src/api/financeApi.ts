import apiClient from './client';

export interface FinanceTransaction {
  id: number;
  report: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export const financeApi = {
  // Test finance.view permission
  getFinanceData: async (): Promise<FinanceTransaction> => {
    const response = await apiClient.get('/test/finance');
    return response.data.data;
  },

  // Test finance.create permission
  createTransaction: async (): Promise<{ transaction: string; id: number }> => {
    const response = await apiClient.post('/test/finance');
    return response.data.data;
  },

  // Test finance.edit permission
  updateTransaction: async (id: number): Promise<{ transaction: string; id: number }> => {
    const response = await apiClient.patch(`/test/finance/${id}`);
    return response.data.data;
  },

  // Test finance.delete permission
  deleteTransaction: async (id: number): Promise<{ transaction: string; id: number }> => {
    const response = await apiClient.delete(`/test/finance/${id}`);
    return response.data.data;
  },
};

