export interface PaymentRequest {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  screenshot: string; // base64 string
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

export type LanguageCode = "uz" | "ru" | "en";
