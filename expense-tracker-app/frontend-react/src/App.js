import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import LoanSummaryWidget from './components/LoanSummaryWidget';
import ExpenseSummaryTable from './components/ExpenseSummaryTable';
import NetWorthWidget from './components/NetWorthWidget';
import ActionButtons from './components/ActionButtons';
import ExpenseModal from './components/modals/ExpenseModal';
import LoanModal from './components/modals/LoanModal';
import CommitteeModal from './components/modals/CommitteeModal';
import IncomeModal from './components/modals/IncomeModal';
import { apiService } from './services/apiService';

function App() {
  const [dashboardData, setDashboardData] = useState({
    monthly_expenses: 0,
    monthly_income: 0,
    total_savings: 0,
    net_worth: 0
  });
  
  const [modals, setModals] = useState({
    expense: false,
    loan: false,
    committee: false,
    income: false
  });

  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardOverview();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (modalType) => {
    setModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
  };

  const handleDataUpdate = () => {
    // Refresh dashboard data when new data is added
    loadDashboardData();
    // Trigger refresh for all child components
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            className: 'toast-success',
          },
          error: {
            duration: 5000,
            className: 'toast-error',
          },
        }}
      />
      
      <Header />
      
      <DashboardOverview 
        data={dashboardData} 
        loading={loading} 
      />
      
      <ActionButtons 
        onOpenModal={openModal} 
      />

      {/* Enhanced Dashboard Components */}
      <div className="dashboard-widgets">
        <LoanSummaryWidget refreshTrigger={refreshTrigger} />
        <NetWorthWidget refreshTrigger={refreshTrigger} />
        <ExpenseSummaryTable refreshTrigger={refreshTrigger} />
      </div>

      {/* Modals */}
      {modals.expense && (
        <ExpenseModal 
          isOpen={modals.expense}
          onClose={() => closeModal('expense')}
          onSuccess={handleDataUpdate}
        />
      )}

      {modals.loan && (
        <LoanModal 
          isOpen={modals.loan}
          onClose={() => closeModal('loan')}
          onSuccess={handleDataUpdate}
        />
      )}

      {modals.committee && (
        <CommitteeModal 
          isOpen={modals.committee}
          onClose={() => closeModal('committee')}
          onSuccess={handleDataUpdate}
        />
      )}

      {modals.income && (
        <IncomeModal 
          isOpen={modals.income}
          onClose={() => closeModal('income')}
          onSuccess={handleDataUpdate}
        />
      )}
    </div>
  );
}

export default App;
