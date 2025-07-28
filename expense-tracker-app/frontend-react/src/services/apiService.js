import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📤 Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Dashboard
  getDashboardOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // Expenses
  getExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  addExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Loans
  getLoans: async () => {
    const response = await api.get('/loans');
    return response.data;
  },

  addLoan: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },

  // Committees
  getCommittees: async () => {
    const response = await api.get('/committees');
    return response.data;
  },

  addCommittee: async (committeeData) => {
    const response = await api.post('/committees', committeeData);
    return response.data;
  },

  addCommitteePayment: async (committeeId, paymentData) => {
    const response = await api.post(`/committees/${committeeId}/payment`, paymentData);
    return response.data;
  },

  // Income
  addIncome: async (incomeData) => {
    const response = await api.post('/income', incomeData);
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const response = await api.get('/payment-methods');
    return response.data;
  },

  // Analytics
  getMonthlyAnalytics: async () => {
    const response = await api.get('/analytics/monthly-summary');
    return response.data;
  },

  getLoanTimeline: async () => {
    const response = await api.get('/analytics/loan-timeline');
    return response.data;
  },

  getNetValues: async (month) => {
    const response = await api.get(`/analytics/net-values/${month}`);
    return response.data;
  },

  // Test connection
  testConnection: async () => {
    try {
      const response = await api.get('/dashboard/overview');
      console.log('✅ API Connection successful');
      return true;
    } catch (error) {
      console.error('❌ API Connection failed:', error);
      return false;
    }
  }
};
