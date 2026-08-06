export type BuyerType = "first-time" | "second-time";

export interface MortgageInput {
    propertyPrice: number;
    deposit: number;
    buyerType: BuyerType;
    isJoint: boolean;
    income1: number;
    income2: number;
    interestRate: number; // annual %, e.g. 3.75
    termYears: number;
    isNewBuild: boolean;
    isFreshStart: boolean; // previously owned but no longer has a financial interest (separation, divorce, bankruptcy, etc.)
    combineHtbWithFhs: boolean;
}

export interface SchemeResult {
    eligible: boolean;
    reasons: string[];
}

export interface HelpToBuyResult extends SchemeResult {
    amount: number;
}

export interface FirstHomeSchemeResult extends SchemeResult {
    minEquity: number;
    maxEquity: number;
}

export interface MortgageResult {
    combinedIncome: number;
    requiredLoan: number;
    ltiMultiplier: number;
    maxLoanByLTI: number;
    maxLoanByLTV: number;
    maxLoan: number;
    isAffordable: boolean;
    depositPercent: number;
    monthlyRepayment: number;
    totalRepaid: number;
    totalInterest: number;
    helpToBuy: HelpToBuyResult;
    firstHomeScheme: FirstHomeSchemeResult;
    localAuthorityHomeLoan: SchemeResult;
}

// Central Bank of Ireland macroprudential mortgage measures (2026)
const LTI_MULTIPLIER: Record<BuyerType, number> = {
    "first-time": 4,
    "second-time": 3.5,
};
const MAX_LTV = 0.9;

// Help to Buy (Revenue, 2026)
const HTB_PROPERTY_CEILING = 500_000;
const HTB_MAX_RATE = 0.10;
const HTB_MAX_AMOUNT = 30_000;

// First Home Scheme (2026)
const FHS_PROPERTY_CEILING = 500_000; // varies by local authority — treated as a general guide
const FHS_MAX_EQUITY_STANDALONE = 0.30;
const FHS_MAX_EQUITY_WITH_HTB = 0.20;
const FHS_MIN_EQUITY_RATE = 0.025;
const FHS_MIN_EQUITY_FLOOR = 10_000;

// Local Authority Home Loan (2026)
const LAHL_INCOME_LIMIT_SINGLE = 80_000;
const LAHL_INCOME_LIMIT_JOINT = 85_000;

export function calcMonthlyRepayment(principal: number, annualRatePercent: number, termYears: number): number {
    const months = termYears * 12;
    if (months <= 0) return 0;
    if (principal <= 0) return 0;

    const monthlyRate = annualRatePercent / 100 / 12;
    if (monthlyRate === 0) return principal / months;

    const factor = Math.pow(1 + monthlyRate, months);
    return (principal * monthlyRate * factor) / (factor - 1);
}

export function calcHelpToBuy(input: MortgageInput): HelpToBuyResult {
    const reasons: string[] = [];
    if (input.buyerType !== "first-time") reasons.push("Only available to first-time buyers");
    if (!input.isNewBuild) reasons.push("Property must be a new build or a qualifying self-build");
    if (input.propertyPrice > HTB_PROPERTY_CEILING) reasons.push(`Property price exceeds the €${HTB_PROPERTY_CEILING.toLocaleString()} ceiling`);

    const eligible = reasons.length === 0;
    const amount = eligible ? Math.min(input.propertyPrice * HTB_MAX_RATE, HTB_MAX_AMOUNT) : 0;

    return { eligible, reasons, amount };
}

export function calcFirstHomeScheme(input: MortgageInput, depositPercent: number): FirstHomeSchemeResult {
    const reasons: string[] = [];
    if (input.buyerType !== "first-time" && !input.isFreshStart) {
        reasons.push("Only available to first-time buyers or Fresh Start applicants");
    }
    if (!input.isNewBuild) reasons.push("Property must be a new build or a qualifying self-build");
    if (input.propertyPrice > FHS_PROPERTY_CEILING) reasons.push(`Property price exceeds the typical €${FHS_PROPERTY_CEILING.toLocaleString()} local authority ceiling`);
    if (depositPercent < 10) reasons.push("Requires a minimum deposit of 10% of the purchase price");

    const eligible = reasons.length === 0;
    const maxEquityRate = input.combineHtbWithFhs ? FHS_MAX_EQUITY_WITH_HTB : FHS_MAX_EQUITY_STANDALONE;
    const minEquity = eligible ? Math.max(input.propertyPrice * FHS_MIN_EQUITY_RATE, FHS_MIN_EQUITY_FLOOR) : 0;
    const maxEquity = eligible ? input.propertyPrice * maxEquityRate : 0;

    return { eligible, reasons, minEquity, maxEquity };
}

export function calcLocalAuthorityHomeLoan(input: MortgageInput, combinedIncome: number): SchemeResult {
    const reasons: string[] = [];
    if (input.buyerType !== "first-time" && !input.isFreshStart) {
        reasons.push("Generally only available to first-time buyers or Fresh Start applicants");
    }
    const incomeLimit = input.isJoint ? LAHL_INCOME_LIMIT_JOINT : LAHL_INCOME_LIMIT_SINGLE;
    if (combinedIncome > incomeLimit) reasons.push(`Combined income exceeds the €${incomeLimit.toLocaleString()} limit`);
    reasons.push("Requires proof you couldn't get sufficient finance from two commercial lenders");

    return { eligible: reasons.length === 1, reasons };
}

export function calcMortgage(input: MortgageInput): MortgageResult {
    const combinedIncome = input.income1 + (input.isJoint ? input.income2 : 0);
    const requiredLoan = Math.max(0, input.propertyPrice - input.deposit);
    const ltiMultiplier = LTI_MULTIPLIER[input.buyerType];
    const maxLoanByLTI = combinedIncome * ltiMultiplier;
    const maxLoanByLTV = input.propertyPrice * MAX_LTV;
    const maxLoan = Math.min(maxLoanByLTI, maxLoanByLTV);
    const isAffordable = requiredLoan > 0 && requiredLoan <= maxLoan;
    const depositPercent = input.propertyPrice > 0 ? (input.deposit / input.propertyPrice) * 100 : 0;

    const monthlyRepayment = calcMonthlyRepayment(requiredLoan, input.interestRate, input.termYears);
    const totalRepaid = monthlyRepayment * input.termYears * 12;
    const totalInterest = Math.max(0, totalRepaid - requiredLoan);

    const helpToBuy = calcHelpToBuy(input);
    const firstHomeScheme = calcFirstHomeScheme(input, depositPercent);
    const localAuthorityHomeLoan = calcLocalAuthorityHomeLoan(input, combinedIncome);

    return {
        combinedIncome,
        requiredLoan,
        ltiMultiplier,
        maxLoanByLTI,
        maxLoanByLTV,
        maxLoan,
        isAffordable,
        depositPercent,
        monthlyRepayment,
        totalRepaid,
        totalInterest,
        helpToBuy,
        firstHomeScheme,
        localAuthorityHomeLoan,
    };
}
