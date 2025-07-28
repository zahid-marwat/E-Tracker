import React from 'react';

const Header = () => {
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="app-header">
      <h1>
        <i className="fas fa-wallet"></i> Enhanced Expense Tracker
      </h1>
      <div className="currency-display">Currency: PKR (₨)</div>
      <div className="date-display">{getCurrentDate()}</div>
    </header>
  );
};

export default Header;
