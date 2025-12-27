
export interface BNCCAbility {
  code: string;
  description: string;
}

export type UserTier = 'free' | 'premium';

export type EducatorProfile = 'tradicional' | 'inovador' | 'ludico' | 'humanista' | 'tecnologico';

export interface EducatorProfileInfo {
  id: EducatorProfile;
  label: string;
  description: string;
  icon: string;
}

export const EDUCATOR_PROFILES: EducatorProfileInfo[] = [
  { id: 'tradicional', label: 'Tradicional', description: 'Foco em conteúdo, estrutura e formalidade.', icon: '📜' },
  { id: 'inovador', label: 'Inovador', description: 'Metodologias ativas, STEAM e desafios.', icon: '💡' },
  { id: 'ludico', label: 'Lúdico', description: 'Gamificação, jogos e aprendizado divertido.', icon: '🎮' },
  { id: 'humanista', label: 'Humanista', description: 'Foco no socioemocional e empatia.', icon: '🌱' },
  { id: 'tecnologico', label: 'Tecnológico', description: 'Cultura digital, apps e ferramentas online.', icon: '💻' }
];

export interface LessonStep {
  title: string;
  duration: string;
  description: string;
}

export interface MentalMapNode {
  label: string;
  children?: string[];
}

export interface StudentTracking {
  observationCriteria: string[];
  participationNotes: string;
  difficultyNotes: string;
}

export interface LessonPlan {
  title: string;
  subject: string;
  grade: string;
  duration: string;
  bnccCodes: string[];
  objectives: string;
  methodology: string;
  steps: LessonStep[]; 
  resources: string;
  evaluation: string;
  tips: string;
  supportingText: string;
  studentText: string;
  mentalMap: {
    centralTheme: string;
    nodes: MentalMapNode[];
  };
  slideOutline: string[];
  studentTracking?: StudentTracking;
}

export interface MonthlyUnit {
  title: string;
  period: string;
  mainThemes: string[];
  bnccCodes: string[];
  competencies: string;
  suggestedProjects: string;
}

export interface MonthlyPlan {
  month: string;
  year: string;
  subject: string;
  grade: string;
  units: MonthlyUnit[];
  methodologicalGuideline: string;
  assessmentLogic: string;
}

export interface AnnualPlan {
  year: string;
  subject: string;
  grade: string;
  units: MonthlyUnit[]; 
  methodologicalGuideline: string;
  assessmentLogic: string;
}

export interface SavedPlan {
  id: string;
  type: 'monthly' | 'lesson' | 'annual';
  date: string;
  data: LessonPlan | MonthlyPlan | AnnualPlan;
}

export const SUBJECTS = [
  'Língua Portuguesa', 'Matemática', 'Ciências', 'História', 'Geografia', 'Artes', 
  'Educação Física', 'Ensino Religioso', 'Língua Inglesa', 'Biologia', 'Física', 
  'Química', 'Filosofia', 'Sociologia'
];

export const GRADES_BY_LEVEL = {
  'Educação Infantil': ['Berçário', 'Maternal I', 'Maternal II', 'Pré-escola I', 'Pré-escola II'],
  'Ensino Fundamental I': ['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'],
  'Ensino Fundamental II': ['6º Ano', '7º Ano', '8º Ano', '9º Ano'],
  'Ensino Médio': ['1ª Série', '2ª Série', '3ª Série']
};

export const LEVELS = Object.keys(GRADES_BY_LEVEL);
