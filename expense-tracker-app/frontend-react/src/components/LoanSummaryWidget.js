import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '../services/apiService';

const LoanSummaryWidget = ({ refreshTrigger = 0 }) => {
  const [loanData, setLoanData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoanData();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const loadLoanData = async () => {
    try {
      setLoading(true); // Show loading state during refresh
      const data = await apiService.getLoans();
      setLoanData(data);
    } catch (error) {
      console.error('Error loading loan data:', error);
      toast.error('Failed to load loan data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₨${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateTotals = () => {
    let totalGiven = 0;
    let totalTaken = 0;
    let totalReceived = 0;
    let netAmount = 0;

    Object.values(loanData).forEach(person => {
      totalGiven += person.given || 0;
      totalTaken += person.taken || 0;
      totalReceived += person.received_back || 0;
    });

    netAmount = totalGiven - totalTaken - totalReceived;

    return { totalGiven, totalTaken, totalReceived, netAmount };
  };

  if (loading) {
    return (
      <div className="loan-summary-widget">
        <h3><i className="fas fa-handshake"></i> Loan Summary</h3>
        <div className="loading">Loading loan data...</div>
      </div>
    );
  }

  const { totalGiven, totalTaken, totalReceived, netAmount } = calculateTotals();

  return (
    <div className="loan-summary-widget">
      <h3><i className="fas fa-handshake"></i> Loan Summary</h3>
      
      <div className="loan-metrics">
        <div className="metric-card given">
          <i className="fas fa-arrow-up"></i>
          <span className="label">Total Given</span>
          <span className="amount">{formatCurrency(totalGiven)}</span>
        </div>
        
        <div className="metric-card taken">
          <i className="fas fa-arrow-down"></i>
          <span className="label">Total Taken</span>
          <span className="amount">{formatCurrency(totalTaken)}</span>
        </div>
        
        <div className="metric-card received">
          <i className="fas fa-undo"></i>
          <span className="label">Received Back</span>
          <span className="amount">{formatCurrency(totalReceived)}</span>
        </div>
        
        <div className={`metric-card net ${netAmount >= 0 ? 'positive' : 'negative'}`}>
          <i className={`fas ${netAmount >= 0 ? 'fa-plus' : 'fa-minus'}`}></i>
          <span className="label">Net Position</span>
          <span className="amount">{formatCurrency(Math.abs(netAmount))}</span>
          <span className="position">{netAmount >= 0 ? 'Owed to you' : 'You owe'}</span>
        </div>
      </div>

      <div className="person-breakdown">
        <h4>Person-wise Breakdown</h4>
        <div className="person-list">
          {Object.entries(loanData).map(([personName, personData]) => (
            <div key={personName} className="person-item">
              <span className="person-name">{personName}</span>
              <div className="person-amounts">
                <span className="given">Given: {formatCurrency(personData.given)}</span>
                <span className="taken">Taken: {formatCurrency(personData.taken)}</span>
                <span className="received">Received: {formatCurrency(personData.received_back)}</span>
                <span className={`net ${personData.net_amount >= 0 ? 'positive' : 'negative'}`}>
                  Net: {formatCurrency(Math.abs(personData.net_amount))} 
                  {personData.net_amount >= 0 ? ' (owes you)' : ' (you owe)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanSummaryWidget;
