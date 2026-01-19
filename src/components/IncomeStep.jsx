import React, { useState, useEffect } from 'react';

function IncomeStep({ data, updateData, nextStep, prevStep }) {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const totalIncome =
    formData.w2Wages1 +
    formData.w2Wages2 +
    formData.interestIncome +
    formData.dividendIncome +
    formData.capitalGains +
    Math.max(0, formData.seIncome - formData.seExpenses);

  return (
    <div className="step-content">
      <h2>Income</h2>
      <p className="step-description">
        Enter all sources of income for the 2025 tax year
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>W-2 Wages</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="w2Wages1">Your W-2 Wages</label>
              <input
                type="number"
                id="w2Wages1"
                min="0"
                step="0.01"
                value={formData.w2Wages1 || ''}
                onChange={(e) => handleChange('w2Wages1', e.target.value)}
                className="form-control"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="w2Wages2">Spouse's W-2 Wages</label>
              <input
                type="number"
                id="w2Wages2"
                min="0"
                step="0.01"
                value={formData.w2Wages2 || ''}
                onChange={(e) => handleChange('w2Wages2', e.target.value)}
                className="form-control"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Investment Income</h3>
          <div className="form-group">
            <label htmlFor="interestIncome">Interest Income</label>
            <input
              type="number"
              id="interestIncome"
              min="0"
              step="0.01"
              value={formData.interestIncome || ''}
              onChange={(e) => handleChange('interestIncome', e.target.value)}
              className="form-control"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="dividendIncome">Dividend Income</label>
            <input
              type="number"
              id="dividendIncome"
              min="0"
              step="0.01"
              value={formData.dividendIncome || ''}
              onChange={(e) => handleChange('dividendIncome', e.target.value)}
              className="form-control"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="capitalGains">Capital Gains</label>
            <input
              type="number"
              id="capitalGains"
              step="0.01"
              value={formData.capitalGains || ''}
              onChange={(e) => handleChange('capitalGains', e.target.value)}
              className="form-control"
              placeholder="0"
            />
            <small className="form-hint">Enter negative value for capital losses</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Self-Employment Income</h3>
          <div className="form-group">
            <label htmlFor="seIncome">Self-Employment Income</label>
            <input
              type="number"
              id="seIncome"
              min="0"
              step="0.01"
              value={formData.seIncome || ''}
              onChange={(e) => handleChange('seIncome', e.target.value)}
              className="form-control"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="seExpenses">Self-Employment Expenses</label>
            <input
              type="number"
              id="seExpenses"
              min="0"
              step="0.01"
              value={formData.seExpenses || ''}
              onChange={(e) => handleChange('seExpenses', e.target.value)}
              className="form-control"
              placeholder="0"
            />
          </div>
        </div>

        <div className="summary-box">
          <strong>Total Income: {formatCurrency(totalIncome)}</strong>
        </div>

        <div className="button-group">
          <button type="button" onClick={prevStep} className="btn btn-secondary">
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Next: Withholding
          </button>
        </div>
      </form>
    </div>
  );
}

export default IncomeStep;
