// Irish Motor Tax bands 2025
export const CO2_BANDS = [
    { max: 0, label: "Electric (0g/km)", annual: 120, biannual: 66, quarterly: 34 },
    { max: 80, label: "A0 (1–80g/km)", annual: 180, biannual: 99, quarterly: 51 },
    { max: 100, label: "A1 (81–100g/km)", annual: 180, biannual: 99, quarterly: 51 },
    { max: 110, label: "A2 (101–110g/km)", annual: 210, biannual: 116, quarterly: 59 },
    { max: 120, label: "A3 (111–120g/km)", annual: 270, biannual: 149, quarterly: 76 },
    { max: 140, label: "B1 (121–140g/km)", annual: 390, biannual: 215, quarterly: 109 },
    { max: 155, label: "B2 (141–155g/km)", annual: 570, biannual: 314, quarterly: 159 },
    { max: 170, label: "C (156–170g/km)", annual: 750, biannual: 413, quarterly: 209 },
    { max: 190, label: "D (171–190g/km)", annual: 1050, biannual: 578, quarterly: 293 },
    { max: 225, label: "E (191–225g/km)", annual: 1350, biannual: 743, quarterly: 376 },
    { max: 999, label: "F+ (226g/km+)", annual: 2350, biannual: 1293, quarterly: 654 },
];

// Engine size bands (pre-2008)
export const ENGINE_BANDS = [
    { max: 1000, label: "Up to 1000cc", annual: 199 },
    { max: 1100, label: "1001–1100cc", annual: 299 },
    { max: 1200, label: "1101–1200cc", annual: 330 },
    { max: 1300, label: "1201–1300cc", annual: 358 },
    { max: 1400, label: "1301–1400cc", annual: 386 },
    { max: 1500, label: "1401–1500cc", annual: 414 },
    { max: 1600, label: "1501–1600cc", annual: 469 },
    { max: 1700, label: "1601–1700cc", annual: 524 },
    { max: 1800, label: "1701–1800cc", annual: 574 },
    { max: 1900, label: "1801–1900cc", annual: 624 },
    { max: 2000, label: "1901–2000cc", annual: 674 },
    { max: 2500, label: "2001–2500cc", annual: 756 },
    { max: 3000, label: "2501–3000cc", annual: 1044 },
    { max: 9999, label: "Over 3000cc", annual: 1467 },
];

export function getTaxBand(co2: number, isElectric: boolean) {
    if (isElectric) return CO2_BANDS[0];
    return CO2_BANDS.find(b => co2 <= b.max) || CO2_BANDS[CO2_BANDS.length - 1];
}

export interface FuelCostResult {
    litresUsed: number;
    fuelCost: number;
    costPer100km: number;
}

export function computeFuelCost(
    distance: number,
    distUnit: "km" | "miles",
    consumption: number,
    consUnit: "L/100km" | "mpg",
    fuelPrice: number
): FuelCostResult {
    const distKm = distUnit === "miles" ? distance * 1.60934 : distance;
    const lPer100 = consUnit === "mpg" ? 282.48 / consumption : consumption;
    const litresUsed = (distKm / 100) * lPer100;
    const fuelCost = litresUsed * fuelPrice;
    const costPer100km = (100 / distKm) * fuelCost;

    return { litresUsed, fuelCost, costPer100km };
}
