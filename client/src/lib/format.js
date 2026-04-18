export const formatCurrency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(n) || 0);

export const formatNumber = (n) =>
  new Intl.NumberFormat("en-US").format(Number(n) || 0);
