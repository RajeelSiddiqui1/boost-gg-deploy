/**
 * Production-Ready Price Calculator for Boost Marketplace
 * Handles: Fixed, Range-based (e.g. lvl 2-10), and Quantity-based (e.g. 100k gold)
 */
const calculateServicePrice = (pricingRules, params = {}) => {
    if (!pricingRules) return 0;

    let finalPrice = 0;
    const { type, basePrice = 0, min_value = 0, price_per_unit = 0, discount_percentage = 0 } = pricingRules;
    const { quantity = 1, current_value = 0, target_value = 0 } = params;

    switch (type) {
        case 'fixed':
            finalPrice = basePrice;
            break;

        case 'range':
            // Logic: (Target - Current) * Price per Level
            const range = Math.max(0, target_value - current_value);
            finalPrice = range * price_per_unit;
            break;

        case 'quantity':
            // Logic: Total Quantity * Price per Unit
            finalPrice = quantity * price_per_unit;
            break;

        default:
            finalPrice = basePrice;
    }

    // Apply Discount
    if (discount_percentage > 0) {
        finalPrice = finalPrice * (1 - discount_percentage / 100);
    }

    return Math.round(finalPrice * 100) / 100; // Round to 2 decimals
};

module.exports = { calculateServicePrice };
