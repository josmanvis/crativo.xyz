export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ContactInfo {
  email: string;
  socialLinks: SocialLink[];
  calendarUrl: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
