import React from 'react';

const DashboardOverview = ({ data, loading }) => {
  const formatCurrency = (amount) => {
    return `₨${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <section className="dashboard-overview">
        <h2><i className="fas fa-tachometer-alt"></i> Dashboard Overview</h2>
        <div className="overview-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="overview-card loading">
              <i className="fas fa-spinner fa-spin"></i>
              <h3>Loading...</h3>
              <span className="amount">₨0.00</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-overview">
      <h2><i className="fas fa-tachometer-alt"></i> Dashboard Overview</h2>
      <div className="overview-grid">
        <div className="overview-card income">
          <i className="fas fa-hand-holding-usd"></i>
          <h3>Monthly Income</h3>
          <span className="amount">{formatCurrency(data.monthly_income || 0)}</span>
        </div>
        <div className="overview-card expenses">
          <i className="fas fa-credit-card"></i>
          <h3>Total Expenses</h3>
          <span className="amount">{formatCurrency(data.monthly_expenses || 0)}</span>
        </div>
        <div className="overview-card savings">
          <i className="fas fa-piggy-bank"></i>
          <h3>Total Savings</h3>
          <span className="amount">{formatCurrency(data.total_savings || 0)}</span>
        </div>
        <div className="overview-card net-worth">
          <i className="fas fa-chart-line"></i>
          <h3>Net Worth</h3>
          <span className="amount">{formatCurrency(data.net_worth || 0)}</span>
        </div>
      </div>
    </section>
  );
};

export default DashboardOverview;
