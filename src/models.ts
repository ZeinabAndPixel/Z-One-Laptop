
export interface Project {
  id?: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  tags: string[];
  image: string;
  link?: string;
}

export interface Skill {
  id?: string;
  name_es: string; 
  name_en: string; 
  icon: string;
}

export interface Experience {
  id?: string;
  company: string;
  role_es: string;
  role_en: string;
  duration_es: string;
  duration_en: string;
  description_es: string;
  description_en: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree_es: string;
  degree_en: string;
  year: string;
}

export interface Software {
  id?: string;
  name: string; 
  imageUrl: string;
}

export interface QRCode {
  id?: string;
  platform_es: string;
  platform_en: string;
  imageUrl: string;
  link: string;
}

export interface PersonalInfo {
  name: string;
  gpa: string;
  languages_es: string;
  languages_en: string;
  nationality_es: string;
  nationality_en: string;
  email: string;
  phone: string;
  location_es: string;
  location_en: string;
  bio_es: string;
  bio_en: string;
  focus_es: string;
  focus_en: string;
  photoUrl: string;
}
