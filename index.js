// VINV Tax Estimator - Professional Tax Calculator
// 2024 Federal Tax Brackets and Standard Deductions

const TAX_YEAR = 2024;

// 2024 Federal Tax Brackets
const TAX_BRACKETS = {
    single: [
        { rate: 0.10, min: 0, max: 11600 },
        { rate: 0.12, min: 11600, max: 47150 },
        { rate: 0.22, min: 47150, max: 100525 },
        { rate: 0.24, min: 100525, max: 191950 },
        { rate: 0.32, min: 191950, max: 243725 },
        { rate: 0.35, min: 243725, max: 609350 },
        { rate: 0.37, min: 609350, max: Infinity }
    ],
    'married-joint': [
        { rate: 0.10, min: 0, max: 23200 },
        { rate: 0.12, min: 23200, max: 94300 },
        { rate: 0.22, min: 94300, max: 201050 },
        { rate: 0.24, min: 201050, max: 383900 },
        { rate: 0.32, min: 383900, max: 487450 },
        { rate: 0.35, min: 487450, max: 731200 },
        { rate: 0.37, min: 731200, max: Infinity }
    ],
    'married-separate': [
        { rate: 0.10, min: 0, max: 11600 },
        { rate: 0.12, min: 11600, max: 47150 },
        { rate: 0.22, min: 47150, max: 100525 },
        { rate: 0.24, min: 100525, max: 191950 },
        { rate: 0.32, min: 191950, max: 243725 },
        { rate: 0.35, min: 243725, max: 365600 },
        { rate: 0.37, min: 365600, max: Infinity }
    ],
    head: [
        { rate: 0.10, min: 0, max: 16550 },
        { rate: 0.12, min: 16550, max: 63100 },
        { rate: 0.22, min: 63100, max: 100500 },
        { rate: 0.24, min: 100500, max: 191950 },
        { rate: 0.32, min: 191950, max: 243700 },
        { rate: 0.35, min: 243700, max: 609350 },
        { rate: 0.37, min: 609350, max: Infinity }
    ]
};

// 2024 Standard Deductions
const STANDARD_DEDUCTIONS = {
    single: 14600,
    'married-joint': 29200,
    'married-separate': 14600,
    head: 21900
};

// Child Tax Credit per dependent (2024)
const CHILD_TAX_CREDIT = 2000;

// Social Security and Medicare Tax Rates
const FICA_RATES = {
    socialSecurity: 0.062, // 6.2%
    medicare: 0.0145, // 1.45%
    additionalMedicare: 0.009, // 0.9% for high earners
    socialSecurityWageBase: 168600 // 2024 wage base limit
};

// DOM Elements
const taxForm = document.getElementById('taxForm');
const resultsSection = document.getElementById('results');
const deductionTypeSelect = document.getElementById('deductionType');
const itemizedGroup = document.getElementById('itemizedGroup');

// Event Listeners
deductionTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'itemized') {
        itemizedGroup.style.display = 'block';
    } else {
        itemizedGroup.style.display = 'none';
    }
});

taxForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateTax();
});

taxForm.addEventListener('reset', () => {
    resultsSection.style.display = 'none';
    itemizedGroup.style.display = 'none';
});

// Main Tax Calculation Function
function calculateTax() {
    // Get form values
    const filingStatus = document.getElementById('filingStatus').value;
    const annualIncome = parseFloat(document.getElementById('annualIncome').value) || 0;
    const additionalIncome = parseFloat(document.getElementById('additionalIncome').value) || 0;
    const deductionType = document.getElementById('deductionType').value;
    const itemizedAmount = parseFloat(document.getElementById('itemizedAmount').value) || 0;
    const retirement401k = parseFloat(document.getElementById('retirement401k').value) || 0;
    const dependents = parseInt(document.getElementById('dependents').value) || 0;
    const stateRate = parseFloat(document.getElementById('stateRate').value) / 100 || 0;

    // Calculate gross income
    const grossIncome = annualIncome + additionalIncome;

    // Calculate AGI (Adjusted Gross Income)
    const agi = grossIncome - retirement401k;

    // Calculate deductions
    let totalDeductions;
    if (deductionType === 'itemized') {
        totalDeductions = Math.max(itemizedAmount, STANDARD_DEDUCTIONS[filingStatus]);
    } else {
        totalDeductions = STANDARD_DEDUCTIONS[filingStatus];
    }

    // Calculate taxable income
    const taxableIncome = Math.max(0, agi - totalDeductions);

    // Calculate federal income tax
    const federalTax = calculateFederalTax(taxableIncome, filingStatus);

    // Calculate child tax credit
    const childTaxCredit = dependents * CHILD_TAX_CREDIT;
    const finalFederalTax = Math.max(0, federalTax - childTaxCredit);

    // Calculate FICA taxes
    const ficaTax = calculateFICATax(grossIncome);

    // Calculate state tax
    const stateTax = grossIncome * stateRate;

    // Calculate total tax
    const totalTax = finalFederalTax + ficaTax + stateTax;

    // Calculate effective tax rate
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome * 100) : 0;

    // Calculate net income
    const netIncome = grossIncome - totalTax;

    // Display results
    displayResults({
        grossIncome,
        agi,
        totalDeductions,
        taxableIncome,
        federalTax: finalFederalTax,
        stateTax,
        ficaTax,
        totalTax,
        effectiveRate,
        netIncome,
        filingStatus
    });
}

// Calculate Federal Income Tax using progressive brackets
function calculateFederalTax(taxableIncome, filingStatus) {
    const brackets = TAX_BRACKETS[filingStatus];
    let tax = 0;
    let bracketDetails = [];

    for (let i = 0; i < brackets.length; i++) {
        const bracket = brackets[i];

        if (taxableIncome <= bracket.min) {
            break;
        }

        const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;

        if (incomeInBracket > 0) {
            const taxInBracket = incomeInBracket * bracket.rate;
            tax += taxInBracket;

            bracketDetails.push({
                rate: bracket.rate * 100,
                income: incomeInBracket,
                tax: taxInBracket,
                min: bracket.min,
                max: bracket.max
            });
        }
    }

    // Store bracket details for display
    window.currentBracketDetails = bracketDetails;

    return tax;
}

// Calculate FICA taxes (Social Security + Medicare)
function calculateFICATax(grossIncome) {
    // Social Security tax (capped at wage base)
    const socialSecurityIncome = Math.min(grossIncome, FICA_RATES.socialSecurityWageBase);
    const socialSecurityTax = socialSecurityIncome * FICA_RATES.socialSecurity;

    // Medicare tax (no cap)
    let medicareTax = grossIncome * FICA_RATES.medicare;

    // Additional Medicare tax for high earners (over $200,000)
    if (grossIncome > 200000) {
        medicareTax += (grossIncome - 200000) * FICA_RATES.additionalMedicare;
    }

    return socialSecurityTax + medicareTax;
}

// Display Results
function displayResults(results) {
    // Update result values
    document.getElementById('resultGrossIncome').textContent = formatCurrency(results.grossIncome);
    document.getElementById('resultAGI').textContent = formatCurrency(results.agi);
    document.getElementById('resultDeductions').textContent = formatCurrency(results.totalDeductions);
    document.getElementById('resultTaxableIncome').textContent = formatCurrency(results.taxableIncome);
    document.getElementById('resultFederalTax').textContent = formatCurrency(results.federalTax);
    document.getElementById('resultStateTax').textContent = formatCurrency(results.stateTax);
    document.getElementById('resultFICATax').textContent = formatCurrency(results.ficaTax);
    document.getElementById('resultTotalTax').textContent = formatCurrency(results.totalTax);
    document.getElementById('resultEffectiveRate').textContent = results.effectiveRate.toFixed(2) + '%';
    document.getElementById('resultNetIncome').textContent = formatCurrency(results.netIncome);

    // Display tax bracket details
    displayBracketDetails();

    // Show results section with smooth scroll
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display Tax Bracket Breakdown
function displayBracketDetails() {
    const bracketDetailsDiv = document.getElementById('bracketDetails');
    const details = window.currentBracketDetails || [];

    if (details.length === 0) {
        bracketDetailsDiv.innerHTML = '<p>No federal tax owed (income below taxable threshold)</p>';
        return;
    }

    let html = '';
    details.forEach((bracket, index) => {
        const maxDisplay = bracket.max === Infinity ? '+' : formatCurrency(bracket.max);
        html += `
            <div class="bracket-item">
                <div class="bracket-rate">${bracket.rate}% Tax Bracket</div>
                <div class="bracket-income">Income: ${formatCurrency(bracket.min)} - ${maxDisplay}</div>
                <div class="bracket-income">Your income in this bracket: ${formatCurrency(bracket.income)}</div>
                <div class="bracket-tax">Tax from this bracket: ${formatCurrency(bracket.tax)}</div>
            </div>
        `;
    });

    bracketDetailsDiv.innerHTML = html;
}

// Format number as currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('VINV Tax Estimator initialized successfully');
    console.log(`Tax Year: ${TAX_YEAR}`);
});
