export type MerchantCtaStatus =
  | "guest"
  | "admin"
  | "merchant"
  | "pending"
  | "apply";

export type MerchantCtaNotification = {
  id: string;
  title: string;
  message: string;
};
