import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { apiService } from '../../services/apiService';

const CommitteeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    monthly_amount: '',
    expected_receiving_amount: '',
    expected_receiving_date: ''
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
    
    if (!formData.name || !formData.start_date || !formData.end_date || 
        !formData.monthly_amount || !formData.expected_receiving_amount || 
        !formData.expected_receiving_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Submitting committee data:', formData);
      
      const result = await apiService.addCommittee({
        ...formData,
        monthly_amount: parseFloat(formData.monthly_amount),
        expected_receiving_amount: parseFloat(formData.expected_receiving_amount)
      });
      
      console.log('✅ Committee added successfully:', result);
      
      toast.success('Committee added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        monthly_amount: '',
        expected_receiving_amount: '',
        expected_receiving_date: ''
      });
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('❌ Error adding committee:', error);
      toast.error('Failed to add committee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Committee">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Committee Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter committee name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="start_date">Start Date *</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date *</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="monthly_amount">Monthly Amount to Pay (₨) *</label>
          <input
            type="number"
            id="monthly_amount"
            name="monthly_amount"
            value={formData.monthly_amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="expected_receiving_amount">Expected Receiving Amount (₨) *</label>
          <input
            type="number"
            id="expected_receiving_amount"
            name="expected_receiving_amount"
            value={formData.expected_receiving_amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="expected_receiving_date">Expected Receiving Date *</label>
          <input
            type="date"
            id="expected_receiving_date"
            name="expected_receiving_date"
            value={formData.expected_receiving_date}
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
              Adding Committee...
            </>
          ) : (
            'Add Committee'
          )}
        </button>
      </form>
    </Modal>
  );
};

export default CommitteeModal;
