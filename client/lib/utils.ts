import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    const locale = currency === "INR" ? "en-IN" : "en-US";
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string, currency = "USD"): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  if (!parsedDate.isValid()) return "Not provided";
  
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return parsedDate.toDate().toLocaleDateString(locale);
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};