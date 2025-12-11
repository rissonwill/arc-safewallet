// Stripe Products Configuration
// These IDs should match your Stripe Dashboard products

export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: {
    name: "SmartVault Pro (Mensal)",
    priceId: "price_pro_monthly", // Replace with actual Stripe Price ID
    amount: 2900, // $29.00 in cents
    interval: "month" as const,
  },
  PRO_YEARLY: {
    name: "SmartVault Pro (Anual)",
    priceId: "price_pro_yearly", // Replace with actual Stripe Price ID
    amount: 29000, // $290.00 in cents
    interval: "year" as const,
  },
  ENTERPRISE_MONTHLY: {
    name: "SmartVault Enterprise (Mensal)",
    priceId: "price_enterprise_monthly", // Replace with actual Stripe Price ID
    amount: 19900, // $199.00 in cents
    interval: "month" as const,
  },
  ENTERPRISE_YEARLY: {
    name: "SmartVault Enterprise (Anual)",
    priceId: "price_enterprise_yearly", // Replace with actual Stripe Price ID
    amount: 199000, // $1990.00 in cents
    interval: "year" as const,
  },
};

export type ProductKey = keyof typeof STRIPE_PRODUCTS;

export function getProductByPlan(plan: "pro" | "enterprise", interval: "month" | "year"): typeof STRIPE_PRODUCTS[ProductKey] {
  const key = `${plan.toUpperCase()}_${interval === "month" ? "MONTHLY" : "YEARLY"}` as ProductKey;
  return STRIPE_PRODUCTS[key];
}
