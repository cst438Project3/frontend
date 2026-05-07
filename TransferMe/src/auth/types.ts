export type StudentProfile = {
  studentId: number;
  userId: string;
  email: string;
  name: string;
  currentInstitutionId: number | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number | null;
  student: StudentProfile | null;
};

export type AuthMe = {
  userId: string;
  email: string;
  name: string;
  student: StudentProfile | null;
};

export type StoredAuthState = {
  session: AuthSession;
  user: AuthMe;
};
