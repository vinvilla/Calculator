import React, { useState } from 'react';
import { calculateTaxes } from '../utils/taxCalculations';

function ResultsStep({ formData, prevStep, goToStep }) {
  const [expandedSections, setExpandedSections] = useState({
    income: false,
    deductions: false,
    credits: false,
    federal: false,
    california: false
  });

  const taxResults = calculateTaxes(formData);
  const { federal, california } = taxResults;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPercent = (value) => {
    return (value * 100).toFixed(2) + '%';
  };

  return (
    <div className="step-content results-page">
      <h2>Tax Calculation Results</h2>
      <p className="step-description">
        Your estimated 2025 federal and California state tax results
      </p>

      {/* Main Results Summary */}
      <div className="results-summary">
        <div className="result-card federal">
          <h3>Federal Tax</h3>
          <div className="result-amount">
            <span className={federal.refundOrOwed >= 0 ? 'refund' : 'owed'}>
              {federal.refundOrOwed >= 0 ? 'REFUND' : 'AMOUNT OWED'}
            </span>
            <div className="amount">
              {formatCurrency(Math.abs(federal.refundOrOwed))}
            </div>
          </div>
          <div className="result-details">
            <div className="detail-row">
              <span>Tax Owed:</span>
              <span>{formatCurrency(federal.taxAfterCredits)}</span>
            </div>
            <div className="detail-row">
              <span>Withheld:</span>
              <span>{formatCurrency(federal.federalWithheld)}</span>
            </div>
          </div>
        </div>

        <div className="result-card california">
          <h3>California State Tax</h3>
          <div className="result-amount">
            <span className={california.refundOrOwed >= 0 ? 'refund' : 'owed'}>
              {california.refundOrOwed >= 0 ? 'REFUND' : 'AMOUNT OWED'}
            </span>
            <div className="amount">
              {formatCurrency(Math.abs(california.refundOrOwed))}
            </div>
          </div>
          <div className="result-details">
            <div className="detail-row">
              <span>Tax Owed:</span>
              <span>{formatCurrency(california.caTax)}</span>
            </div>
            <div className="detail-row">
              <span>Withheld:</span>
              <span>{formatCurrency(california.caWithheld)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="expandable-sections">
        {/* Income Breakdown */}
        <div className="expandable-section">
          <button
            className="section-header"
            onClick={() => toggleSection('income')}
          >
            <span className="section-title">Income Breakdown</span>
            <span className="toggle-icon">{expandedSections.income ? '−' : '+'}</span>
          </button>
          {expandedSections.income && (
            <div className="section-content">
              <div className="detail-row">
                <span>W-2 Wages (Yours):</span>
                <span>{formatCurrency(formData.income.w2Wages1)}</span>
              </div>
              <div className="detail-row">
                <span>W-2 Wages (Spouse):</span>
                <span>{formatCurrency(formData.income.w2Wages2)}</span>
              </div>
              <div className="detail-row">
                <span>Interest Income:</span>
                <span>{formatCurrency(formData.income.interestIncome)}</span>
              </div>
              <div className="detail-row">
                <span>Dividend Income:</span>
                <span>{formatCurrency(formData.income.dividendIncome)}</span>
              </div>
              <div className="detail-row">
                <span>Capital Gains:</span>
                <span>{formatCurrency(formData.income.capitalGains)}</span>
              </div>
              {federal.netSEIncome > 0 && (
                <>
                  <div className="detail-row">
                    <span>Self-Employment Income:</span>
                    <span>{formatCurrency(formData.income.seIncome)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Self-Employment Expenses:</span>
                    <span>({formatCurrency(formData.income.seExpenses)})</span>
                  </div>
                  <div className="detail-row">
                    <span>Net Self-Employment Income:</span>
                    <span>{formatCurrency(federal.netSEIncome)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Self-Employment Tax:</span>
                    <span>{formatCurrency(federal.seTax)}</span>
                  </div>
                  <div className="detail-row">
                    <span>SE Tax Deduction (50%):</span>
                    <span>({formatCurrency(federal.seDeduction)})</span>
                  </div>
                </>
              )}
              <div className="detail-row total">
                <span><strong>Total Income:</strong></span>
                <span><strong>{formatCurrency(federal.totalIncome)}</strong></span>
              </div>
              <div className="detail-row total">
                <span><strong>Adjusted Gross Income (AGI):</strong></span>
                <span><strong>{formatCurrency(federal.agi)}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Deductions Comparison */}
        <div className="expandable-section">
          <button
            className="section-header"
            onClick={() => toggleSection('deductions')}
          >
            <span className="section-title">Deductions</span>
            <span className="toggle-icon">{expandedSections.deductions ? '−' : '+'}</span>
          </button>
          {expandedSections.deductions && (
            <div className="section-content">
              <h4>Federal Deductions</h4>
              <div className="detail-row">
                <span>Standard Deduction (MFJ):</span>
                <span>{formatCurrency(federal.standardDeduction)}</span>
              </div>
              {federal.itemizedBreakdown.totalItemized > 0 && (
                <>
                  <div className="detail-row">
                    <span>Mortgage Interest:</span>
                    <span>{formatCurrency(federal.itemizedBreakdown.mortgageInterest)}</span>
                  </div>
                  <div className="detail-row">
                    <span>SALT Deduction (capped at $10k):</span>
                    <span>{formatCurrency(federal.itemizedBreakdown.saltDeduction)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Charitable Contributions:</span>
                    <span>{formatCurrency(federal.itemizedBreakdown.charitableContributions)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Medical Expenses (over 7.5% AGI):</span>
                    <span>{formatCurrency(federal.itemizedBreakdown.medicalExpenses)}</span>
                  </div>
                  {federal.itemizedBreakdown.otherDeductions > 0 && (
                    <div className="detail-row">
                      <span>Other Deductions:</span>
                      <span>{formatCurrency(federal.itemizedBreakdown.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span>Total Itemized Deductions:</span>
                    <span>{formatCurrency(federal.itemizedDeduction)}</span>
                  </div>
                </>
              )}
              <div className="detail-row total">
                <span><strong>Deduction Used:</strong></span>
                <span>
                  <strong>
                    {formatCurrency(federal.deduction)}
                    {federal.useItemized ? ' (Itemized)' : ' (Standard)'}
                  </strong>
                </span>
              </div>

              <h4 style={{ marginTop: '20px' }}>California Deductions</h4>
              <div className="detail-row">
                <span>Standard Deduction (MFJ):</span>
                <span>{formatCurrency(california.caStandardDeduction)}</span>
              </div>
              {california.caItemizedDeduction > 0 && (
                <div className="detail-row">
                  <span>Total Itemized Deductions (no SALT cap):</span>
                  <span>{formatCurrency(california.caItemizedDeduction)}</span>
                </div>
              )}
              <div className="detail-row total">
                <span><strong>Deduction Used:</strong></span>
                <span>
                  <strong>
                    {formatCurrency(california.caDeduction)}
                    {california.useItemized ? ' (Itemized)' : ' (Standard)'}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tax Credits */}
        <div className="expandable-section">
          <button
            className="section-header"
            onClick={() => toggleSection('credits')}
          >
            <span className="section-title">Tax Credits</span>
            <span className="toggle-icon">{expandedSections.credits ? '−' : '+'}</span>
          </button>
          {expandedSections.credits && (
            <div className="section-content">
              {federal.aotc > 0 ? (
                <>
                  <div className="detail-row">
                    <span>American Opportunity Tax Credit:</span>
                    <span>{formatCurrency(federal.aotc)}</span>
                  </div>
                  <p className="credit-note">
                    AOTC eligibility based on income of {formatCurrency(federal.agi)}
                  </p>
                </>
              ) : formData.personalInfo.hasChildInCollege ? (
                <p className="credit-note">
                  AOTC not available - income exceeds phase-out limit ($180,000 for MFJ)
                </p>
              ) : (
                <p className="credit-note">No credits applied</p>
              )}
            </div>
          )}
        </div>

        {/* Federal Tax Detail */}
        <div className="expandable-section">
          <button
            className="section-header"
            onClick={() => toggleSection('federal')}
          >
            <span className="section-title">Federal Tax Calculation</span>
            <span className="toggle-icon">{expandedSections.federal ? '−' : '+'}</span>
          </button>
          {expandedSections.federal && (
            <div className="section-content">
              <div className="detail-row">
                <span>Adjusted Gross Income:</span>
                <span>{formatCurrency(federal.agi)}</span>
              </div>
              <div className="detail-row">
                <span>Deduction:</span>
                <span>({formatCurrency(federal.deduction)})</span>
              </div>
              <div className="detail-row total">
                <span><strong>Taxable Income:</strong></span>
                <span><strong>{formatCurrency(federal.taxableIncome)}</strong></span>
              </div>
              <div className="detail-row">
                <span>Tax Before Credits:</span>
                <span>{formatCurrency(federal.taxBeforeCredits)}</span>
              </div>
              {federal.aotc > 0 && (
                <div className="detail-row">
                  <span>Tax Credits:</span>
                  <span>({formatCurrency(federal.aotc)})</span>
                </div>
              )}
              <div className="detail-row total">
                <span><strong>Total Federal Tax:</strong></span>
                <span><strong>{formatCurrency(federal.taxAfterCredits)}</strong></span>
              </div>
              <div className="detail-row">
                <span>Effective Tax Rate:</span>
                <span>
                  {federal.totalIncome > 0
                    ? formatPercent(federal.taxAfterCredits / federal.totalIncome)
                    : '0%'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* California Tax Detail */}
        <div className="expandable-section">
          <button
            className="section-header"
            onClick={() => toggleSection('california')}
          >
            <span className="section-title">California Tax Calculation</span>
            <span className="toggle-icon">{expandedSections.california ? '−' : '+'}</span>
          </button>
          {expandedSections.california && (
            <div className="section-content">
              <div className="detail-row">
                <span>California AGI:</span>
                <span>{formatCurrency(california.caAgi)}</span>
              </div>
              <div className="detail-row">
                <span>Deduction:</span>
                <span>({formatCurrency(california.caDeduction)})</span>
              </div>
              <div className="detail-row total">
                <span><strong>Taxable Income:</strong></span>
                <span><strong>{formatCurrency(california.caTaxableIncome)}</strong></span>
              </div>
              <div className="detail-row total">
                <span><strong>Total California Tax:</strong></span>
                <span><strong>{formatCurrency(california.caTax)}</strong></span>
              </div>
              <div className="detail-row">
                <span>Effective Tax Rate:</span>
                <span>
                  {california.caAgi > 0
                    ? formatPercent(california.caTax / california.caAgi)
                    : '0%'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="button-group">
        <button type="button" onClick={prevStep} className="btn btn-secondary">
          Back
        </button>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="btn btn-outline"
        >
          Start Over
        </button>
      </div>

      <div className="disclaimer">
        <strong>Disclaimer:</strong> This calculator provides directional estimates only.
        Tax laws are complex and this calculator makes simplifications. Always consult
        with a qualified tax professional for accurate tax advice.
      </div>
    </div>
  );
}

export default ResultsStep;
