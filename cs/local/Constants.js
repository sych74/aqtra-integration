//@auth

var AQTRA = "aqtra";
var AQTRA_LICENSE_TARIFF = "AQTra License Tariff";
var DEFAULT_CURRENCY = "USD";

// Pricing tiers based on cloudlet ranges (for reference)
// Actual pricing is defined in add_aqtra_grids.yaml tariffs
var CLOUDLET_TIERS = [
    { min: 1, max: 7, pricePerHour: 0.00043, pricePerMonth: 0.31250, discount: 0 },
    { min: 8, max: 14, pricePerHour: 0.00043, pricePerMonth: 0.30938, discount: 1 },
    { min: 15, max: 29, pricePerHour: 0.00043, pricePerMonth: 0.30625, discount: 2 },
    { min: 30, max: 59, pricePerHour: 0.00042, pricePerMonth: 0.30313, discount: 3 },
    { min: 60, max: 119, pricePerHour: 0.00041, pricePerMonth: 0.29688, discount: 5 },
    { min: 120, max: 239, pricePerHour: 0.00041, pricePerMonth: 0.29375, discount: 6 },
    { min: 240, max: Infinity, pricePerHour: 0.00040, pricePerMonth: 0.29063, discount: 7 }
];
