export type Status = "single" | "married";

export interface Breakdown {
    gross: number;
    incomeTax: number;
    usc: number;
    prsi: number;
    totalDeductions: number;
    net: number;
    effectiveRate: number;
}

export function calcTax(gross: number, status: Status, pension: number): Breakdown {
    const pensionAmount = gross * (pension / 100);
    const taxableIncome = Math.max(0, gross - pensionAmount);

    // Income Tax (2025)
    const cutoff = status === "married" ? 51000 : 42000;
    const standardTax = Math.min(taxableIncome, cutoff) * 0.20;
    const higherTax = Math.max(0, taxableIncome - cutoff) * 0.40;
    const personalCredit = status === "married" ? 3750 : 1875;
    const employeeCredit = 1875;
    const incomeTax = Math.max(0, standardTax + higherTax - personalCredit - employeeCredit);

    // USC (2025)
    let usc = 0;
    if (taxableIncome <= 13000) {
        usc = 0; // exempt
    } else {
        usc += Math.min(taxableIncome, 12012) * 0.005;
        if (taxableIncome > 12012) usc += Math.min(taxableIncome - 12012, 13748) * 0.02;
        if (taxableIncome > 25760) usc += Math.min(taxableIncome - 25760, 44284) * 0.04;
        if (taxableIncome > 70044) usc += (taxableIncome - 70044) * 0.08;
    }

    // PRSI (Class A - employee, 4%)
    const prsi = taxableIncome > 18304 ? taxableIncome * 0.04 : 0;

    const totalDeductions = incomeTax + usc + prsi + pensionAmount;
    const net = gross - totalDeductions;
    const effectiveRate = gross > 0 ? (totalDeductions / gross) * 100 : 0;

    return { gross, incomeTax, usc, prsi, totalDeductions, net, effectiveRate };
}
