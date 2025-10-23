// File: src/lib/types.ts

// Shared settings for all apps
export interface AppSettings {
  geminiApiKey: string;
  userName: string;
  // userJobTitle: string; // 👈 REMOVE THIS LINE
  githubLink: string;
  websiteLink: string;
  linkedinLink: string;
  coverLetterModel: string;
  cvGenieModel: string;
}

// CV Genie specific types
export type AppStatus = 'idle' | 'processing' | 'editing' | 'error';

// ... (rest of the file is unchanged)
export interface ProfilePhoto {
    mimeType: string;
    data: string;
}

export interface WorkExperience {
    title: string;
    company: string;
    location: string;
    dates: string;
    description: string[];
}

export interface Project {
    name: string;
    description: string;
    url?: string;
}

export interface Certification {
    name: string;
    issuer: string;
    date: string;
}

export interface Education {
    institution: string;
    degree: string;
    dates: string;
}

export interface CuratedCVData {
    name: string;
    title: string; 
    contactInfo: {
        email: string;
        phone: string;
        location: string;
        linkedin: string;
        github: string;
        portfolio: string;
    };
    summary: string;
    skills: { [category: string]: string[] };
    workExperience: WorkExperience[];
    projects: Project[];
    certifications: Certification[];
    education: Education[];
    personalData?: {
        dateOfBirth?: string;
        placeOfBirth?: string;
        nationality?: string;
    };
}