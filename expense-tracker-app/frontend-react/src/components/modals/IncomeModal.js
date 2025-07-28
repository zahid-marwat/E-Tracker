import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { apiService } from '../../services/apiService';

const IncomeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    month_year: new Date().toISOString().slice(0, 7) // Current month in YYYY-MM format
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.source || !formData.month_year) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Submitting income data:', formData);
      
      const result = await apiService.addIncome({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      console.log('✅ Income added successfully:', result);
      
      toast.success('Income added successfully!');
      
      // Reset form
      setFormData({
        amount: '',
        source: '',
        month_year: new Date().toISOString().slice(0, 7)
      });
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('❌ Error adding income:', error);
      toast.error('Failed to add income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Monthly Income">
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="source">Source *</label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
            placeholder="e.g., Salary, Business, Freelance"
          />
        </div>

        <div className="form-group">
          <label htmlFor="month_year">Month *</label>
          <input
            type="month"
            id="month_year"
            name="month_year"
            value={formData.month_year}
            onChange={handleChange}
            required
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
              Adding Income...
            </>
          ) : (
            'Add Income'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default IncomeModal;
