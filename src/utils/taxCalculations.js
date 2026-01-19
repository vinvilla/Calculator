// 2025 Federal Tax Brackets for Married Filing Jointly
const FEDERAL_BRACKETS_MFJ = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 }
];

// 2025 California Tax Brackets for Married Filing Jointly
const CA_BRACKETS_MFJ = [
  { min: 0, max: 21280, rate: 0.01 },
  { min: 21280, max: 50470, rate: 0.02 },
  { min: 50470, max: 79666, rate: 0.04 },
  { min: 79666, max: 110630, rate: 0.06 },
  { min: 110630, max: 140126, rate: 0.08 },
  { min: 140126, max: 710950, rate: 0.093 },
  { min: 710950, max: 853140, rate: 0.103 },
  { min: 853140, max: 1422350, rate: 0.113 },
  { min: 1422350, max: Infinity, rate: 0.123 }
];

// 2025 Standard Deductions
const STANDARD_DEDUCTION_MFJ = 30000;
const CA_STANDARD_DEDUCTION_MFJ = 11306;

// Self-employment tax rate
const SE_TAX_RATE = 0.153; // 15.3% (Social Security + Medicare)
const SE_DEDUCTION_RATE = 0.5; // Can deduct 50% of SE tax

// AOTC Phase-out limits for MFJ (2025 estimated)
const AOTC_MAX_CREDIT = 2500;
const AOTC_PHASEOUT_START_MFJ = 160000;
const AOTC_PHASEOUT_END_MFJ = 180000;

/**
 * Calculate tax based on progressive brackets
 */
function calculateTaxFromBrackets(taxableIncome, brackets) {
  let tax = 0;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;

    if (taxableIncome <= bracket.max) break;
  }

  return tax;
}

/**
 * Calculate American Opportunity Tax Credit
 */
function calculateAOTC(hasChildInCollege, magi) {
  if (!hasChildInCollege) return 0;

  // Check if income is within eligible range
  if (magi >= AOTC_PHASEOUT_END_MFJ) return 0;
  if (magi < AOTC_PHASEOUT_START_MFJ) return AOTC_MAX_CREDIT;

  // Phase-out calculation
  const phaseoutRange = AOTC_PHASEOUT_END_MFJ - AOTC_PHASEOUT_START_MFJ;
  const phaseoutAmount = magi - AOTC_PHASEOUT_START_MFJ;
  const phaseoutPercentage = phaseoutAmount / phaseoutRange;

  return AOTC_MAX_CREDIT * (1 - phaseoutPercentage);
}

/**
 * Calculate total income
 */
export function calculateTotalIncome(incomeData) {
  const {
    w2Wages1 = 0,
    w2Wages2 = 0,
    interestIncome = 0,
    dividendIncome = 0,
    capitalGains = 0,
    seIncome = 0,
    seExpenses = 0
  } = incomeData;

  const netSEIncome = Math.max(0, seIncome - seExpenses);
  const totalIncome =
    w2Wages1 +
    w2Wages2 +
    interestIncome +
    dividendIncome +
    capitalGains +
    netSEIncome;

  return {
    totalIncome,
    netSEIncome,
    w2Income: w2Wages1 + w2Wages2
  };
}

/**
 * Calculate itemized deductions
 */
export function calculateItemizedDeductions(deductionData) {
  const {
    mortgageInterest = 0,
    propertyTaxes = 0,
    charitableContributions = 0,
    stateIncomeTax = 0,
    medicalExpenses = 0,
    otherDeductions = 0
  } = deductionData;

  // SALT cap at $10,000 for federal
  const saltDeduction = Math.min(10000, propertyTaxes + stateIncomeTax);

  return {
    mortgageInterest,
    saltDeduction,
    propertyTaxes,
    stateIncomeTax,
    charitableContributions,
    medicalExpenses,
    otherDeductions,
    totalItemized:
      mortgageInterest +
      saltDeduction +
      charitableContributions +
      medicalExpenses +
      otherDeductions
  };
}

/**
 * Calculate federal taxes
 */
export function calculateFederalTax(formData) {
  const { income, deductions, personalInfo, credits, withholding } = formData;

  // Calculate total income
  const { totalIncome, netSEIncome, w2Income } = calculateTotalIncome(income);

  // Calculate self-employment tax and deduction
  const seTax = netSEIncome * SE_TAX_RATE;
  const seDeduction = seTax * SE_DEDUCTION_RATE;

  // Calculate AGI
  const agi = totalIncome - seDeduction;

  // Calculate itemized deductions
  const itemizedCalc = calculateItemizedDeductions(deductions);

  // Medical expenses - only amount over 7.5% of AGI
  const medicalThreshold = agi * 0.075;
  const deductibleMedical = Math.max(0, itemizedCalc.medicalExpenses - medicalThreshold);
  itemizedCalc.totalItemized =
    itemizedCalc.totalItemized - itemizedCalc.medicalExpenses + deductibleMedical;
  itemizedCalc.medicalExpenses = deductibleMedical;

  // Choose standard or itemized deduction
  const standardDeduction = STANDARD_DEDUCTION_MFJ;
  const useItemized = itemizedCalc.totalItemized > standardDeduction;
  const deduction = useItemized ? itemizedCalc.totalItemized : standardDeduction;

  // Calculate taxable income
  const taxableIncome = Math.max(0, agi - deduction);

  // Calculate tax before credits
  const taxBeforeCredits = calculateTaxFromBrackets(taxableIncome, FEDERAL_BRACKETS_MFJ);

  // Calculate AOTC
  const aotc = calculateAOTC(personalInfo.hasChildInCollege, agi);

  // Calculate final tax
  const taxAfterCredits = Math.max(0, taxBeforeCredits - aotc);

  // Calculate refund or amount owed
  const federalWithheld = withholding.federalWithheld || 0;
  const refundOrOwed = federalWithheld - taxAfterCredits;

  return {
    totalIncome,
    w2Income,
    netSEIncome,
    seTax,
    seDeduction,
    agi,
    standardDeduction,
    itemizedDeduction: itemizedCalc.totalItemized,
    itemizedBreakdown: itemizedCalc,
    useItemized,
    deduction,
    taxableIncome,
    taxBeforeCredits,
    aotc,
    taxAfterCredits,
    federalWithheld,
    refundOrOwed
  };
}

/**
 * Calculate California state taxes
 */
export function calculateCaliforniaTax(formData, federalCalc) {
  const { income, deductions, withholding } = formData;

  // California uses federal AGI as starting point
  const caAgi = federalCalc.agi;

  // California itemized deductions (no SALT cap for CA)
  const caItemizedCalc = calculateItemizedDeductions(deductions);

  // Medical expenses - same 7.5% threshold
  const medicalThreshold = caAgi * 0.075;
  const deductibleMedical = Math.max(0, caItemizedCalc.medicalExpenses - medicalThreshold);

  // CA itemized includes full state and property taxes (no cap)
  const caItemizedTotal =
    caItemizedCalc.mortgageInterest +
    caItemizedCalc.propertyTaxes +
    caItemizedCalc.stateIncomeTax +
    caItemizedCalc.charitableContributions +
    deductibleMedical +
    caItemizedCalc.otherDeductions;

  // Choose standard or itemized deduction for CA
  const caStandardDeduction = CA_STANDARD_DEDUCTION_MFJ;
  const useItemized = caItemizedTotal > caStandardDeduction;
  const caDeduction = useItemized ? caItemizedTotal : caStandardDeduction;

  // Calculate CA taxable income
  const caTaxableIncome = Math.max(0, caAgi - caDeduction);

  // Calculate CA tax
  const caTax = calculateTaxFromBrackets(caTaxableIncome, CA_BRACKETS_MFJ);

  // Calculate refund or amount owed
  const caWithheld = withholding.caWithheld || 0;
  const refundOrOwed = caWithheld - caTax;

  return {
    caAgi,
    caStandardDeduction,
    caItemizedDeduction: caItemizedTotal,
    useItemized,
    caDeduction,
    caTaxableIncome,
    caTax,
    caWithheld,
    refundOrOwed
  };
}

/**
 * Calculate complete tax summary
 */
export function calculateTaxes(formData) {
  const federalCalc = calculateFederalTax(formData);
  const caCalc = calculateCaliforniaTax(formData, federalCalc);

  return {
    federal: federalCalc,
    california: caCalc
  };
}
