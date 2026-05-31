export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  photo: string;
  age: string;
  educationLevel: string;
  military: string;
  driverLicense: string;
  monthlySalary: string;
  telegram: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  startYear: string;
  gradYear: string;
  description: string;
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Language {
  id: string;
  language: string;
  level: string; // 'native' | 'fluent' | 'intermediate' | 'beginner'
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  education: Education[];
  workExperience: WorkExperience[];
  skills: string[];
  computerSkills: string[];
  certifications: string[];
  languages: Language[];
}

export type LanguageCode = "uz" | "ru" | "en";

export type ResumeTheme = "modern" | "minimal" | "professional" | "premium";

export interface SpacingPreset {
  avatarSize: string;
  paddingClass: string;
  paddingLeftCol: string;
  paddingRightCol: string;
  spacingClass: string;
  itemSpacing: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  screenshot: string; // base64 string
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

