import React from 'react';

const ActionButtons = ({ onOpenModal }) => {
  const buttons = [
    {
      key: 'expense',
      icon: 'fas fa-plus-circle',
      text: 'Add Expense',
      className: 'expense-btn'
    },
    {
      key: 'loan',
      icon: 'fas fa-handshake',
      text: 'Add Loan',
      className: 'loan-btn'
    },
    {
      key: 'committee',
      icon: 'fas fa-users',
      text: 'Add Committee',
      className: 'committee-btn'
    },
    {
      key: 'income',
      icon: 'fas fa-money-bill-wave',
      text: 'Add Income',
      className: 'income-btn'
    }
  ];

  return (
    <section className="action-buttons">
      {buttons.map(button => (
        <button
          key={button.key}
          className={`action-btn ${button.className}`}
          onClick={() => onOpenModal(button.key)}
        >
          <i className={button.icon}></i>
          {button.text}
        </button>
      ))}
    </section>
  );
};

export default ActionButtons;
