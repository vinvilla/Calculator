import React, { useState, useEffect } from 'react';

function PersonalInfo({ data, updateData, nextStep }) {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    updateData(formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-content">
      <h2>Personal Information</h2>
      <p className="step-description">
        Tell us about your filing status and household
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="filingStatus">Filing Status</label>
          <select
            id="filingStatus"
            value={formData.filingStatus}
            onChange={(e) => handleChange('filingStatus', e.target.value)}
            className="form-control"
          >
            <option value="Married Filing Jointly">Married Filing Jointly</option>
          </select>
          <small className="form-hint">Currently supports Married Filing Jointly only</small>
        </div>

        <div className="form-group">
          <label htmlFor="numDependents">Number of Dependents</label>
          <input
            type="number"
            id="numDependents"
            min="0"
            max="20"
            value={formData.numDependents}
            onChange={(e) => handleChange('numDependents', parseInt(e.target.value) || 0)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="hasChildInCollege">Do you have a child in college?</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="hasChildInCollege"
                checked={formData.hasChildInCollege === true}
                onChange={() => handleChange('hasChildInCollege', true)}
              />
              Yes
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="hasChildInCollege"
                checked={formData.hasChildInCollege === false}
                onChange={() => handleChange('hasChildInCollege', false)}
              />
              No
            </label>
          </div>
          <small className="form-hint">
            Required for American Opportunity Tax Credit (AOTC) eligibility
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="state">State of Residence</label>
          <select
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="form-control"
          >
            <option value="California">California</option>
          </select>
          <small className="form-hint">Currently supports California only</small>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Next: Income
          </button>
        </div>
      </form>
    </div>
  );
}

export default PersonalInfo;
