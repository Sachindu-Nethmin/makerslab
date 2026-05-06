export interface CVInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  coursework: string;
  highSchool: string;
  highSchoolYear: string;
  highSchoolStream?: string;
}

export interface Leadership {
  title: string;
  description: string;
}

export interface Certificate {
  name: string;
  category: string;
  issuer: string;
  link: string;
}

export interface CVProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  githubUrl?: string | null;
}
export interface CVUser {
  _id: string;
  name: string;
  email: string;
  linkedin: string;
  github: string;
  bio: string;
  universityId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
