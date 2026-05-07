import { API_BASE_URL } from "@/src/constants/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
};

export type MeUser = {
  id: string;
  email: string;
  name?: string;
};

export type UserProfile = {
  currentCollege?: string;
  targetUniversity?: string;
  major?: string;
};

export type UserClass = {
  id: string;
  courseName: string;
  term?: string;
  grade?: string;
};

export type TransferPath = {
  id: string;
  fromSchool: string;
  toSchool: string;
  major?: string;
  createdAt?: string;
};

type TransferPathCourseInput = {
  courseName: string;
  mappingResult: string;
};

type TransferPathInput = {
  fromSchool: string;
  toSchool: string;
  major?: string;
  courses: TransferPathCourseInput[];
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (payload && (payload.message || payload.error || payload.details)) ||
      `Request failed (${response.status})`;
    throw new Error(String(message));
  }

  return payload as T;
};

export const registerUser = async (input: {
  userId?: string;
  name: string;
  email: string;
  provider?: string;
  currentInstitutionId?: number;
}) => {
  return request<{ id: string; email: string; name: string }>("/api/users/register", {
    method: "POST",
    body: {
      provider: "google",
      ...input,
    },
  });
};

export const getMe = async () => request<MeUser>("/api/users/me");

export const getMyProfile = async () => request<UserProfile>("/api/users/me/profile");

export const updateMyProfile = async (profile: UserProfile) => {
  return request<UserProfile>("/api/users/me/profile", {
    method: "PUT",
    body: profile,
  });
};

export const getMyClasses = async () => {
  const payload = await request<UserClass[] | { classes?: UserClass[] }>("/api/users/me/classes");
  return Array.isArray(payload) ? payload : payload.classes ?? [];
};

export const addMyClass = async (input: {
  courseName: string;
  term?: string;
  grade?: string;
}) => {
  return request<UserClass>("/api/users/me/classes", {
    method: "POST",
    body: input,
  });
};

export const deleteMyClass = async (id: string) => {
  await request<void>(`/api/users/me/classes/${id}`, { method: "DELETE" });
};

export const getMyTransferPaths = async () => {
  const payload = await request<TransferPath[] | { transferPaths?: TransferPath[] }>("/api/users/me/transfer-paths");
  return Array.isArray(payload) ? payload : payload.transferPaths ?? [];
};

export const saveTransferPath = async (input: TransferPathInput) => {
  return request<{ id: string }>("/api/users/me/transfer-paths", {
    method: "POST",
    body: input,
  });
};
