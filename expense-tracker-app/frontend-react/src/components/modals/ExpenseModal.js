import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { apiService } from '../../services/apiService';

const ExpenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    'Food', 'Shopping', 'Home', 'Sports', 'Commute', 
    'Education', 'Trip', 'Committee', 'Others'
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
    
    if (!formData.amount || !formData.description || !formData.category || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Submitting expense data:', formData);
      
      const result = await apiService.addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      console.log('✅ Expense added successfully:', result);
      
      toast.success('Expense added successfully!');
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
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
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="What did you spend on?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where did you spend?"
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
              Adding Expense...
            </>
          ) : (
            'Add Expense'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
