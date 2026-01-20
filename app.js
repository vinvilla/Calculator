const { useState } = React;

// 2025 Federal Tax Brackets for Married Filing Jointly
const TAX_BRACKETS_2025_MFJ = [
    { rate: 0.10, min: 0, max: 23850 },
    { rate: 0.12, min: 23850, max: 96950 },
    { rate: 0.22, min: 96950, max: 206700 },
    { rate: 0.24, min: 206700, max: 394600 },
    { rate: 0.32, min: 394600, max: 501050 },
    { rate: 0.35, min: 501050, max: 751600 },
    { rate: 0.37, min: 751600, max: Infinity }
];

// 2025 Standard Deduction for MFJ
const STANDARD_DEDUCTION_2025_MFJ = 30000;

// 2025 California Tax Brackets for MFJ
const CA_TAX_BRACKETS_2025_MFJ = [
    { rate: 0.01, min: 0, max: 20198 },
    { rate: 0.02, min: 20198, max: 47884 },
    { rate: 0.04, min: 47884, max: 75576 },
    { rate: 0.06, min: 75576, max: 104910 },
    { rate: 0.08, min: 104910, max: 132590 },
    { rate: 0.093, min: 132590, max: 677278 },
    { rate: 0.103, min: 677278, max: 812728 },
    { rate: 0.113, min: 812728, max: 1000000 },
    { rate: 0.123, min: 1000000, max: Infinity }
];

// California Standard Deduction 2025 for MFJ
const CA_STANDARD_DEDUCTION_2025_MFJ = 11296;

// AOTC Maximum Credit
const AOTC_MAX = 2500;
const AOTC_INCOME_PHASE_OUT_START_MFJ = 160000;
const AOTC_INCOME_PHASE_OUT_END_MFJ = 180000;

function TaxEstimatorApp() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Filing Status & Personal Info
        filingStatus: 'married-joint',
        dependents: 0,
        hasCollegeStudent: 'no',
        state: 'California',

        // Step 2: Income
        w2Wages: 0,
        spouseW2Wages: 0,
        interestIncome: 0,
        dividendIncome: 0,
        capitalGains: 0,
        selfEmploymentIncome: 0,
        selfEmploymentExpenses: 0,

        // Step 3: Withholding
        federalWithheld: 0,
        caStateWithheld: 0,

        // Step 4: Deductions
        mortgageInterest: 0,
        propertyTaxes: 0,
        charitableContributions: 0,
        stateIncomeTaxPaid: 0,
        medicalExpenses: 0,
        otherItemizedDeductions: 0,

        // Step 5: Credits
        qualifiedEducationExpenses: 0,
    });

    const [results, setResults] = useState(null);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (currentStep < 6) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const calculateTax = () => {
        // Calculate total income
        const totalW2 = parseFloat(formData.w2Wages) + parseFloat(formData.spouseW2Wages);
        const totalInvestmentIncome = parseFloat(formData.interestIncome) +
                                      parseFloat(formData.dividendIncome) +
                                      parseFloat(formData.capitalGains);
        const selfEmploymentNet = parseFloat(formData.selfEmploymentIncome) -
                                  parseFloat(formData.selfEmploymentExpenses);

        const grossIncome = totalW2 + totalInvestmentIncome + selfEmploymentNet;

        // AGI (simplified - no other adjustments)
        const agi = grossIncome;

        // Calculate itemized deductions
        const totalItemized = parseFloat(formData.mortgageInterest) +
                            parseFloat(formData.propertyTaxes) +
                            parseFloat(formData.charitableContributions) +
                            parseFloat(formData.stateIncomeTaxPaid) +
                            Math.max(0, parseFloat(formData.medicalExpenses) - (agi * 0.075)) +
                            parseFloat(formData.otherItemizedDeductions);

        // Choose larger deduction
        const federalDeduction = Math.max(totalItemized, STANDARD_DEDUCTION_2025_MFJ);
        const usingItemized = totalItemized > STANDARD_DEDUCTION_2025_MFJ;

        // Federal taxable income
        const federalTaxableIncome = Math.max(0, agi - federalDeduction);

        // Calculate federal tax
        const federalTaxOwed = calculateProgressiveTax(federalTaxableIncome, TAX_BRACKETS_2025_MFJ);

        // Calculate AOTC
        let aotc = 0;
        if (formData.hasCollegeStudent === 'yes' && parseFloat(formData.qualifiedEducationExpenses) > 0) {
            const expenses = parseFloat(formData.qualifiedEducationExpenses);
            // 100% of first $2000, 25% of next $2000
            const creditBeforePhaseout = Math.min(2000 + (Math.max(0, expenses - 2000) * 0.25), AOTC_MAX);

            // Apply phase-out
            if (agi > AOTC_INCOME_PHASE_OUT_START_MFJ) {
                if (agi >= AOTC_INCOME_PHASE_OUT_END_MFJ) {
                    aotc = 0;
                } else {
                    const phaseOutPercentage = (AOTC_INCOME_PHASE_OUT_END_MFJ - agi) /
                                              (AOTC_INCOME_PHASE_OUT_END_MFJ - AOTC_INCOME_PHASE_OUT_START_MFJ);
                    aotc = creditBeforePhaseout * phaseOutPercentage;
                }
            } else {
                aotc = creditBeforePhaseout;
            }
        }

        // Final federal tax after credits
        const federalTaxAfterCredits = Math.max(0, federalTaxOwed - aotc);

        // Calculate California tax
        const caItemizedDeduction = usingItemized ? totalItemized : CA_STANDARD_DEDUCTION_2025_MFJ;
        const caTaxableIncome = Math.max(0, agi - caItemizedDeduction);
        const caTaxOwed = calculateProgressiveTax(caTaxableIncome, CA_TAX_BRACKETS_2025_MFJ);

        // Withholding
        const federalWithheld = parseFloat(formData.federalWithheld);
        const caWithheld = parseFloat(formData.caStateWithheld);

        // Refund or owed
        const federalRefundOrOwed = federalWithheld - federalTaxAfterCredits;
        const caRefundOrOwed = caWithheld - caTaxOwed;

        setResults({
            grossIncome,
            agi,
            federalDeduction,
            usingItemized,
            totalItemized,
            federalTaxableIncome,
            federalTaxOwed,
            aotc,
            federalTaxAfterCredits,
            federalWithheld,
            federalRefundOrOwed,
            caTaxableIncome,
            caTaxOwed,
            caWithheld,
            caRefundOrOwed,
            caDeduction: caItemizedDeduction,
            incomeBreakdown: {
                w2: totalW2,
                investment: totalInvestmentIncome,
                selfEmployment: selfEmploymentNet
            },
            deductionComparison: {
                standard: STANDARD_DEDUCTION_2025_MFJ,
                itemized: totalItemized,
                used: federalDeduction
            }
        });

        nextStep();
    };

    const calculateProgressiveTax = (taxableIncome, brackets) => {
        let tax = 0;
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            if (taxableIncome <= bracket.min) break;

            const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
            if (incomeInBracket > 0) {
                tax += incomeInBracket * bracket.rate;
            }
        }
        return tax;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>VINV Tax Estimator</h1>
                <p className="subtitle">2025 Tax Calculator for California</p>
            </header>

            <div className="wizard-container">
                <ProgressBar currentStep={currentStep} totalSteps={6} />

                {currentStep === 1 && (
                    <Step1PersonalInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                    />
                )}

                {currentStep === 2 && (
                    <Step2Income
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                )}

                {currentStep === 3 && (
                    <Step3Withholding
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                )}

                {currentStep === 4 && (
                    <Step4Deductions
                        formData={formData}
                        updateFormData={updateFormData}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                )}

                {currentStep === 5 && (
                    <Step5Credits
                        formData={formData}
                        updateFormData={updateFormData}
                        calculateTax={calculateTax}
                        prevStep={prevStep}
                    />
                )}

                {currentStep === 6 && results && (
                    <Step6Results
                        results={results}
                        formatCurrency={formatCurrency}
                        restartForm={() => {
                            setCurrentStep(1);
                            setResults(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function ProgressBar({ currentStep, totalSteps }) {
    const steps = [
        'Filing Status',
        'Income',
        'Withholding',
        'Deductions',
        'Credits',
        'Results'
    ];

    return (
        <div className="progress-bar">
            {steps.map((step, index) => (
                <div
                    key={index}
                    className={`progress-step ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
                >
                    <div className="step-number">{index + 1}</div>
                    <div className="step-label">{step}</div>
                </div>
            ))}
        </div>
    );
}

function Step1PersonalInfo({ formData, updateFormData, nextStep }) {
    return (
        <div className="step-content">
            <h2>Filing Status & Personal Information</h2>

            <div className="form-group">
                <label>Filing Status</label>
                <select
                    value={formData.filingStatus}
                    onChange={(e) => updateFormData('filingStatus', e.target.value)}
                    disabled
                >
                    <option value="married-joint">Married Filing Jointly</option>
                </select>
                <small>Default: Married Filing Jointly</small>
            </div>

            <div className="form-group">
                <label>Number of Dependents</label>
                <input
                    type="number"
                    min="0"
                    value={formData.dependents}
                    onChange={(e) => updateFormData('dependents', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Do you have a child in college?</label>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="hasCollegeStudent"
                            value="yes"
                            checked={formData.hasCollegeStudent === 'yes'}
                            onChange={(e) => updateFormData('hasCollegeStudent', e.target.value)}
                        />
                        Yes
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="hasCollegeStudent"
                            value="no"
                            checked={formData.hasCollegeStudent === 'no'}
                            onChange={(e) => updateFormData('hasCollegeStudent', e.target.value)}
                        />
                        No
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>State of Residence</label>
                <input
                    type="text"
                    value={formData.state}
                    disabled
                />
                <small>Default: California</small>
            </div>

            <div className="button-group">
                <button className="btn-primary" onClick={nextStep}>
                    Next: Income →
                </button>
            </div>
        </div>
    );
}

function Step2Income({ formData, updateFormData, nextStep, prevStep }) {
    return (
        <div className="step-content">
            <h2>Income</h2>

            <h3>W-2 Wages</h3>
            <div className="form-group">
                <label>Your W-2 Wages</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.w2Wages}
                    onChange={(e) => updateFormData('w2Wages', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>Spouse's W-2 Wages</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.spouseW2Wages}
                    onChange={(e) => updateFormData('spouseW2Wages', e.target.value)}
                    placeholder="0"
                />
            </div>

            <h3>Investment Income</h3>
            <div className="form-group">
                <label>Interest Income</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.interestIncome}
                    onChange={(e) => updateFormData('interestIncome', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>Dividend Income</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.dividendIncome}
                    onChange={(e) => updateFormData('dividendIncome', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>Capital Gains</label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.capitalGains}
                    onChange={(e) => updateFormData('capitalGains', e.target.value)}
                    placeholder="0"
                />
            </div>

            <h3>Self-Employment</h3>
            <div className="form-group">
                <label>Self-Employment Income</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.selfEmploymentIncome}
                    onChange={(e) => updateFormData('selfEmploymentIncome', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>Self-Employment Expenses</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.selfEmploymentExpenses}
                    onChange={(e) => updateFormData('selfEmploymentExpenses', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="button-group">
                <button className="btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button className="btn-primary" onClick={nextStep}>
                    Next: Withholding →
                </button>
            </div>
        </div>
    );
}

function Step3Withholding({ formData, updateFormData, nextStep, prevStep }) {
    return (
        <div className="step-content">
            <h2>Withholding</h2>
            <p className="help-text">Enter the total amount of taxes withheld from your paychecks in 2025</p>

            <div className="form-group">
                <label>Federal Tax Withheld</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.federalWithheld}
                    onChange={(e) => updateFormData('federalWithheld', e.target.value)}
                    placeholder="0"
                />
                <small>Total federal income tax withheld from all W-2s</small>
            </div>

            <div className="form-group">
                <label>California State Tax Withheld</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.caStateWithheld}
                    onChange={(e) => updateFormData('caStateWithheld', e.target.value)}
                    placeholder="0"
                />
                <small>Total California state tax withheld from all W-2s</small>
            </div>

            <div className="button-group">
                <button className="btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button className="btn-primary" onClick={nextStep}>
                    Next: Deductions →
                </button>
            </div>
        </div>
    );
}

function Step4Deductions({ formData, updateFormData, nextStep, prevStep }) {
    return (
        <div className="step-content">
            <h2>Deductions</h2>
            <p className="help-text">Enter your itemized deductions. The calculator will automatically compare to the standard deduction and choose the larger amount.</p>

            <div className="info-box">
                <strong>2025 Standard Deduction (MFJ): $30,000</strong>
            </div>

            <div className="form-group">
                <label>Mortgage Interest</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.mortgageInterest}
                    onChange={(e) => updateFormData('mortgageInterest', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>Property Taxes</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.propertyTaxes}
                    onChange={(e) => updateFormData('propertyTaxes', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>Charitable Contributions</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.charitableContributions}
                    onChange={(e) => updateFormData('charitableContributions', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="form-group">
                <label>State Income Tax Paid</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.stateIncomeTaxPaid}
                    onChange={(e) => updateFormData('stateIncomeTaxPaid', e.target.value)}
                    placeholder="0"
                />
                <small>State and local taxes paid (subject to $10,000 SALT cap)</small>
            </div>

            <div className="form-group">
                <label>Medical Expenses</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.medicalExpenses}
                    onChange={(e) => updateFormData('medicalExpenses', e.target.value)}
                    placeholder="0"
                />
                <small>Only amount exceeding 7.5% of AGI is deductible</small>
            </div>

            <div className="form-group">
                <label>Other Itemized Deductions</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.otherItemizedDeductions}
                    onChange={(e) => updateFormData('otherItemizedDeductions', e.target.value)}
                    placeholder="0"
                />
            </div>

            <div className="button-group">
                <button className="btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button className="btn-primary" onClick={nextStep}>
                    Next: Credits →
                </button>
            </div>
        </div>
    );
}

function Step5Credits({ formData, updateFormData, calculateTax, prevStep }) {
    return (
        <div className="step-content">
            <h2>Credits (AOTC)</h2>
            <p className="help-text">American Opportunity Tax Credit for qualified education expenses</p>

            {formData.hasCollegeStudent === 'yes' ? (
                <>
                    <div className="info-box">
                        <strong>AOTC Information:</strong>
                        <ul>
                            <li>Maximum credit: $2,500 per student</li>
                            <li>100% of first $2,000 + 25% of next $2,000 in expenses</li>
                            <li>Phases out for MFJ income between $160,000-$180,000</li>
                        </ul>
                    </div>

                    <div className="form-group">
                        <label>Qualified Education Expenses</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.qualifiedEducationExpenses}
                            onChange={(e) => updateFormData('qualifiedEducationExpenses', e.target.value)}
                            placeholder="0"
                        />
                        <small>Tuition, fees, and course materials for your college student</small>
                    </div>
                </>
            ) : (
                <div className="info-box">
                    <p>You indicated that you don't have a child in college. AOTC is not applicable.</p>
                    <p>If this is incorrect, go back to Step 1 to update your information.</p>
                </div>
            )}

            <div className="button-group">
                <button className="btn-secondary" onClick={prevStep}>
                    ← Back
                </button>
                <button className="btn-primary btn-calculate" onClick={calculateTax}>
                    Calculate Tax →
                </button>
            </div>
        </div>
    );
}

function Step6Results({ results, formatCurrency, restartForm }) {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="step-content results-content">
            <h2>Tax Calculation Results</h2>

            {/* Federal Results */}
            <div className="results-section">
                <h3>Federal Tax</h3>
                <div className="result-highlight">
                    <div className="result-row">
                        <span className="result-label">Federal Tax Owed:</span>
                        <span className="result-value">{formatCurrency(results.federalTaxAfterCredits)}</span>
                    </div>
                    <div className="result-row">
                        <span className="result-label">Federal Withheld:</span>
                        <span className="result-value">{formatCurrency(results.federalWithheld)}</span>
                    </div>
                    <div className={`result-row refund-row ${results.federalRefundOrOwed >= 0 ? 'refund' : 'owed'}`}>
                        <span className="result-label">
                            {results.federalRefundOrOwed >= 0 ? 'Federal Refund:' : 'Federal Amount Due:'}
                        </span>
                        <span className="result-value-large">
                            {formatCurrency(Math.abs(results.federalRefundOrOwed))}
                        </span>
                    </div>
                </div>
            </div>

            {/* California Results */}
            <div className="results-section">
                <h3>California Tax</h3>
                <div className="result-highlight">
                    <div className="result-row">
                        <span className="result-label">California Tax Owed:</span>
                        <span className="result-value">{formatCurrency(results.caTaxOwed)}</span>
                    </div>
                    <div className="result-row">
                        <span className="result-label">California Withheld:</span>
                        <span className="result-value">{formatCurrency(results.caWithheld)}</span>
                    </div>
                    <div className={`result-row refund-row ${results.caRefundOrOwed >= 0 ? 'refund' : 'owed'}`}>
                        <span className="result-label">
                            {results.caRefundOrOwed >= 0 ? 'California Refund:' : 'California Amount Due:'}
                        </span>
                        <span className="result-value-large">
                            {formatCurrency(Math.abs(results.caRefundOrOwed))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Expandable Sections */}
            <div className="expandable-sections">
                <div className="expandable-section">
                    <button
                        className="expandable-header"
                        onClick={() => toggleSection('income')}
                    >
                        <span>Income Breakdown</span>
                        <span className="expand-icon">{expandedSection === 'income' ? '−' : '+'}</span>
                    </button>
                    {expandedSection === 'income' && (
                        <div className="expandable-content">
                            <div className="result-row">
                                <span>W-2 Wages:</span>
                                <span>{formatCurrency(results.incomeBreakdown.w2)}</span>
                            </div>
                            <div className="result-row">
                                <span>Investment Income:</span>
                                <span>{formatCurrency(results.incomeBreakdown.investment)}</span>
                            </div>
                            <div className="result-row">
                                <span>Self-Employment (Net):</span>
                                <span>{formatCurrency(results.incomeBreakdown.selfEmployment)}</span>
                            </div>
                            <div className="result-row total-row">
                                <span>Gross Income:</span>
                                <span>{formatCurrency(results.grossIncome)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="expandable-section">
                    <button
                        className="expandable-header"
                        onClick={() => toggleSection('deductions')}
                    >
                        <span>Deduction Comparison</span>
                        <span className="expand-icon">{expandedSection === 'deductions' ? '−' : '+'}</span>
                    </button>
                    {expandedSection === 'deductions' && (
                        <div className="expandable-content">
                            <div className="result-row">
                                <span>Standard Deduction:</span>
                                <span>{formatCurrency(results.deductionComparison.standard)}</span>
                            </div>
                            <div className="result-row">
                                <span>Itemized Deduction:</span>
                                <span>{formatCurrency(results.deductionComparison.itemized)}</span>
                            </div>
                            <div className="result-row total-row">
                                <span>Deduction Used ({results.usingItemized ? 'Itemized' : 'Standard'}):</span>
                                <span>{formatCurrency(results.deductionComparison.used)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="expandable-section">
                    <button
                        className="expandable-header"
                        onClick={() => toggleSection('credits')}
                    >
                        <span>Credits Applied</span>
                        <span className="expand-icon">{expandedSection === 'credits' ? '−' : '+'}</span>
                    </button>
                    {expandedSection === 'credits' && (
                        <div className="expandable-content">
                            <div className="result-row">
                                <span>American Opportunity Tax Credit (AOTC):</span>
                                <span>{formatCurrency(results.aotc)}</span>
                            </div>
                            {results.aotc === 0 && (
                                <p className="help-text">No education credits applied</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="expandable-section">
                    <button
                        className="expandable-header"
                        onClick={() => toggleSection('taxable')}
                    >
                        <span>Taxable Income</span>
                        <span className="expand-icon">{expandedSection === 'taxable' ? '−' : '+'}</span>
                    </button>
                    {expandedSection === 'taxable' && (
                        <div className="expandable-content">
                            <div className="result-row">
                                <span>Federal Taxable Income:</span>
                                <span>{formatCurrency(results.federalTaxableIncome)}</span>
                            </div>
                            <div className="result-row">
                                <span>California Taxable Income:</span>
                                <span>{formatCurrency(results.caTaxableIncome)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="expandable-section">
                    <button
                        className="expandable-header"
                        onClick={() => toggleSection('withholding')}
                    >
                        <span>Withholding</span>
                        <span className="expand-icon">{expandedSection === 'withholding' ? '−' : '+'}</span>
                    </button>
                    {expandedSection === 'withholding' && (
                        <div className="expandable-content">
                            <div className="result-row">
                                <span>Federal Withholding:</span>
                                <span>{formatCurrency(results.federalWithheld)}</span>
                            </div>
                            <div className="result-row">
                                <span>California Withholding:</span>
                                <span>{formatCurrency(results.caWithheld)}</span>
                            </div>
                            <div className="result-row total-row">
                                <span>Total Withholding:</span>
                                <span>{formatCurrency(results.federalWithheld + results.caWithheld)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="expandable-section">
                    <button
                        className="expandable-header"
                        onClick={() => toggleSection('final')}
                    >
                        <span>Final Result</span>
                        <span className="expand-icon">{expandedSection === 'final' ? '−' : '+'}</span>
                    </button>
                    {expandedSection === 'final' && (
                        <div className="expandable-content">
                            <div className="result-row">
                                <span>Total Tax Liability:</span>
                                <span>{formatCurrency(results.federalTaxAfterCredits + results.caTaxOwed)}</span>
                            </div>
                            <div className="result-row">
                                <span>Total Withheld:</span>
                                <span>{formatCurrency(results.federalWithheld + results.caWithheld)}</span>
                            </div>
                            <div className={`result-row total-row ${(results.federalRefundOrOwed + results.caRefundOrOwed) >= 0 ? 'refund' : 'owed'}`}>
                                <span>
                                    {(results.federalRefundOrOwed + results.caRefundOrOwed) >= 0 ? 'Total Refund:' : 'Total Amount Due:'}
                                </span>
                                <span className="result-value-large">
                                    {formatCurrency(Math.abs(results.federalRefundOrOwed + results.caRefundOrOwed))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="disclaimer">
                <p><strong>Disclaimer:</strong> This is a simplified tax calculator for educational purposes. Actual tax liability may vary. Consult a tax professional for accurate advice.</p>
            </div>

            <div className="button-group">
                <button className="btn-primary" onClick={restartForm}>
                    Start New Calculation
                </button>
            </div>
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TaxEstimatorApp />);
