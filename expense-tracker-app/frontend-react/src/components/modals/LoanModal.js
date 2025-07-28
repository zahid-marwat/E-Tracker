import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { apiService } from '../../services/apiService';

const LoanModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    loan_type: 'given',
    person_name: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    interest_rate: '0',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const loanTypes = [
    { value: 'given', label: 'Loan Given to Someone' },
    { value: 'taken', label: 'Loan Taken from Someone' },
    { value: 'received_back', label: 'Loan Received Back from Someone' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.person_name || !formData.amount || !formData.loan_type || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Submitting loan data:', formData);
      
      const result = await apiService.addLoan({
        ...formData,
        amount: parseFloat(formData.amount),
        interest_rate: parseFloat(formData.interest_rate)
      });
      
      console.log('✅ Loan added successfully:', result);
      
      toast.success('Loan transaction added successfully!');
      
      // Reset form
      setFormData({
        loan_type: 'given',
        person_name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        due_date: '',
        interest_rate: '0',
        notes: ''
      });
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('❌ Error adding loan:', error);
      toast.error('Failed to add loan transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Loan Transaction">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loan_type">Transaction Type *</label>
          <select
            id="loan_type"
            name="loan_type"
            value={formData.loan_type}
            onChange={handleChange}
            required
          >
            {loanTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="person_name">Person Name *</label>
          <input
            type="text"
            id="person_name"
            name="person_name"
            value={formData.person_name}
            onChange={handleChange}
            required
            placeholder="Enter person's name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (₨) *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Purpose of the loan"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="due_date">Due Date (Optional)</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="interest_rate">Interest Rate (% per annum)</label>
          <input
            type="number"
            id="interest_rate"
            name="interest_rate"
            value={formData.interest_rate}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Adding Loan...
            </>
          ) : (
            'Add Loan Transaction'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default LoanModal;
