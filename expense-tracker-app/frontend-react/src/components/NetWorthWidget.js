import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const NetWorthWidget = ({ refreshTrigger = 0 }) => {
  const [monthlyMetrics, setMonthlyMetrics] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyMetrics();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const loadMonthlyMetrics = async () => {
    try {
      setLoading(true); // Show loading state during refresh
      // Get last 12 months of data
      const promises = [];
      const months = [];
      
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toISOString().slice(0, 7);
        months.push(monthYear);
        promises.push(apiService.getNetValues(monthYear));
      }

      const results = await Promise.all(promises);
      const metricsData = {};
      
      months.forEach((month, index) => {
        metricsData[month] = results[index];
      });

      setMonthlyMetrics(metricsData);
    } catch (error) {
      console.error('Error loading monthly metrics:', error);
      toast.error('Failed to load monthly metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₨${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currentMetrics = monthlyMetrics[selectedMonth] || {};

  const metricItems = [
    { key: 'loan_given', label: 'Loan Given', icon: 'fas fa-arrow-up', color: '#e74c3c' },
    { key: 'loan_taken', label: 'Loan Taken', icon: 'fas fa-arrow-down', color: '#f39c12' },
    { key: 'loan_received_back', label: 'Loan Received Back', icon: 'fas fa-undo', color: '#27ae60' },
    { key: 'net_loan', label: 'Net Loan Position', icon: 'fas fa-balance-scale', color: '#9b59b6' },
    { key: 'income', label: 'Monthly Income', icon: 'fas fa-hand-holding-usd', color: '#1abc9c' },
    { key: 'total_expenses', label: 'Total Expenses', icon: 'fas fa-credit-card', color: '#e67e22' },
    { key: 'total_savings', label: 'Total Savings', icon: 'fas fa-piggy-bank', color: '#34495e' },
    { key: 'net_worth', label: 'Net Worth', icon: 'fas fa-chart-line', color: '#8e44ad' }
  ];

  if (loading) {
    return (
      <div className="net-worth-widget">
        <h3><i className="fas fa-analytics"></i> Net Worth Analytics</h3>
        <div className="loading">Loading analytics data...</div>
      </div>
    );
  }

  const sortedMonths = Object.keys(monthlyMetrics).sort().reverse();
  const maxValues = metricItems.reduce((acc, item) => {
    acc[item.key] = Math.max(...Object.values(monthlyMetrics).map(m => Math.abs(m[item.key] || 0)));
    return acc;
  }, {});

  return (
    <div className="net-worth-widget">
      <h3><i className="fas fa-analytics"></i> Net Worth Analytics</h3>
      
      <div className="month-selector">
        <label htmlFor="monthSelect">Select Month:</label>
        <select 
          id="monthSelect"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {sortedMonths.map(month => (
            <option key={month} value={month}>
              {new Date(month + '-01').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="metrics-grid">
        {metricItems.map(item => {
          const value = currentMetrics[item.key] || 0;
          const isPositive = value >= 0;
          
          return (
            <div key={item.key} className={`metric-card ${item.key} ${isPositive ? 'positive' : 'negative'}`}>
              <div className="metric-header">
                <i className={item.icon} style={{ color: item.color }}></i>
                <span className="metric-label">{item.label}</span>
              </div>
              <div className="metric-value">
                {formatCurrency(Math.abs(value))}
                {!isPositive && <span className="negative-indicator">-</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="comparative-chart">
        <h4>Comparative Analysis</h4>
        <div className="chart-bars">
          {metricItems.map(item => {
            const value = currentMetrics[item.key] || 0;
            const maxVal = maxValues[item.key];
            const percentage = maxVal > 0 ? (Math.abs(value) / maxVal) * 100 : 0;
            const isPositive = value >= 0;
            
            return (
              <div key={item.key} className="chart-bar-item">
                <div className="bar-label">
                  <i className={item.icon} style={{ color: item.color }}></i>
                  <span>{item.label}</span>
                </div>
                <div className="bar-container">
                  <div 
                    className={`bar ${isPositive ? 'positive' : 'negative'}`}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                      opacity: 0.8
                    }}
                  ></div>
                  <span className="bar-value">{formatCurrency(Math.abs(value))}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="trend-summary">
        <h4>Financial Health Summary</h4>
        <div className="summary-items">
          <div className={`summary-item ${currentMetrics.total_savings >= 0 ? 'positive' : 'negative'}`}>
            <i className="fas fa-chart-line"></i>
            <span>Monthly Savings: {formatCurrency(Math.abs(currentMetrics.total_savings || 0))}</span>
            {currentMetrics.total_savings >= 0 ? 
              <span className="status positive">Saving Money</span> : 
              <span className="status negative">Overspending</span>
            }
          </div>
          
          <div className={`summary-item ${currentMetrics.net_loan >= 0 ? 'positive' : 'negative'}`}>
            <i className="fas fa-handshake"></i>
            <span>Loan Position: {formatCurrency(Math.abs(currentMetrics.net_loan || 0))}</span>
            {currentMetrics.net_loan >= 0 ? 
              <span className="status positive">Money Owed to You</span> : 
              <span className="status negative">You Owe Money</span>
            }
          </div>
          
          <div className={`summary-item ${currentMetrics.net_worth >= 0 ? 'positive' : 'negative'}`}>
            <i className="fas fa-trophy"></i>
            <span>Net Worth: {formatCurrency(Math.abs(currentMetrics.net_worth || 0))}</span>
            {currentMetrics.net_worth >= 0 ? 
              <span className="status positive">Positive Net Worth</span> : 
              <span className="status negative">Negative Net Worth</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthWidget;
