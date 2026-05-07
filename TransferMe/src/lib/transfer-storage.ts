import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/src/constants/api";

const CLASSES_KEY = "transferme:classes";
const SELECTED_CLASS_IDS_KEY = "transferme:selected-class-ids";
const TRANSFER_PLANS_KEY = "transferme:transfer-plans";

const TOKENS_KEY = "transferme:auth-tokens";

type StoredTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

type BackendClass = {
  id?: string | number;
  classId?: string | number;
  courseName?: string;
  term?: string;
  grade?: string | number;
  createdAt?: string;
};

async function getAccessToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(TOKENS_KEY);
  const parsed = safeParse<StoredTokens | null>(raw, null);
  if (!parsed?.accessToken) return null;
  return parsed.accessToken;
}

function splitCourseName(courseName: string): { code: string; title: string } {
  const [rawCode, ...rest] = courseName.split("·");
  const code = rawCode?.trim() || courseName.trim() || "COURSE";
  const title = rest.join("·").trim() || "Untitled Course";
  return { code, title };
}

function normalizeBackendClass(item: BackendClass, index: number): SavedClass {
  const id = String(item.id ?? item.classId ?? `${Date.now()}-${index}`);
  const { code, title } = splitCourseName(item.courseName ?? "Untitled Course");
  const credits = Number(item.grade);

  return {
    id,
    code: code.toUpperCase(),
    title,
    credits: Number.isFinite(credits) && credits > 0 ? credits : 3,
    sourceCollege: item.term?.trim() || "My Institution",
    createdAt:
      typeof item.createdAt === "string" && item.createdAt.length > 0
        ? item.createdAt
        : new Date().toISOString(),
  };
}

async function fetchMyClassesFromApi(): Promise<SavedClass[] | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const response = await fetch(`${API_BASE_URL}/api/users/me/classes`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to load classes (${response.status})`);
  }

  const payload = (await response.json()) as BackendClass[] | { classes?: BackendClass[] };
  const list = Array.isArray(payload) ? payload : payload.classes ?? [];
  return list.map(normalizeBackendClass);
}

async function saveClassToApi(input: {
  code: string;
  title: string;
  credits: number;
  sourceCollege?: string;
}): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const response = await fetch(`${API_BASE_URL}/api/users/me/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      courseName: `${input.code.trim().toUpperCase()} · ${input.title.trim()}`,
      term: input.sourceCollege?.trim() || "My Institution",
      grade: String(input.credits),
    }),
  });

  if (response.status === 401 || response.status === 403) {
    return false;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to save class (${response.status})`);
  }

  return true;
}

async function deleteClassFromApi(classId: string): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  const response = await fetch(`${API_BASE_URL}/api/users/me/classes/${encodeURIComponent(classId)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    return false;
  }

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(text || `Failed to delete class (${response.status})`);
  }

  return true;
}

export type SavedClass = {
  id: string;
  code: string;
  title: string;
  credits: number;
  sourceCollege: string;
  createdAt: string;
};

export type TransferPlan = {
  id: string;
  university: string;
  program: string;
  sourceCollege: string;
  credits: number;
  status: "Planned" | "In Progress" | "Complete";
  classes: SavedClass[];
  createdAt: string;
};

export type KnownInstitutions = {
  sourceColleges: string[];
  universities: string[];
};

type BackendInstitution = {
  id?: string | number;
  institutionId?: string | number;
  schoolName?: string;
  name?: string;
  code?: string;
  state?: string;
};

async function fetchInstitutionsFromApi(): Promise<string[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/institutions`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as BackendInstitution[];
    const names = payload
      .map((item) => item.schoolName || item.name || item.code || "")
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return [...new Set(names)];
  } catch {
    return null;
  }
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getSavedClasses(): Promise<SavedClass[]> {
  const raw = await AsyncStorage.getItem(CLASSES_KEY);
  const local = safeParse<SavedClass[]>(raw, []);

  // Fire-and-forget background sync from API — does not block the UI
  fetchMyClassesFromApi()
    .then(async (apiClasses) => {
      if (apiClasses && apiClasses.length > 0) {
        await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(apiClasses));
      }
    })
    .catch(() => {
      // Ignore API errors — local data is the source of truth
    });

  return local;
}

export async function addSavedClass(input: {
  code: string;
  title: string;
  credits: number;
  sourceCollege?: string;
}): Promise<SavedClass[]> {
  const newClass: SavedClass = {
    id: makeId(),
    code: input.code.trim().toUpperCase(),
    title: input.title.trim(),
    credits: input.credits,
    sourceCollege: input.sourceCollege?.trim() || "My Institution",
    createdAt: new Date().toISOString(),
  };

  const existing = safeParse<SavedClass[]>(
    await AsyncStorage.getItem(CLASSES_KEY),
    []
  );
  const updated = [newClass, ...existing];
  await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(updated));

  // Fire-and-forget sync to API
  saveClassToApi({
    code: newClass.code,
    title: newClass.title,
    credits: newClass.credits,
    sourceCollege: newClass.sourceCollege,
  }).catch(() => {
    // Ignore — already saved locally
  });

  return updated;
}

export async function removeSavedClass(id: string): Promise<{
  classes: SavedClass[];
  selectedIds: string[];
}> {
  const existing = safeParse<SavedClass[]>(
    await AsyncStorage.getItem(CLASSES_KEY),
    []
  );
  const updatedClasses = existing.filter((item) => item.id !== id);
  await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(updatedClasses));

  const selectedIds = await getSelectedClassIds();
  const updatedSelectedIds = selectedIds.filter((classId) => classId !== id);
  await AsyncStorage.setItem(
    SELECTED_CLASS_IDS_KEY,
    JSON.stringify(updatedSelectedIds)
  );

  // Fire-and-forget sync to API
  deleteClassFromApi(id).catch(() => {
    // Ignore — already removed locally
  });

  return { classes: updatedClasses, selectedIds: updatedSelectedIds };
}

export async function getSelectedClassIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SELECTED_CLASS_IDS_KEY);
  return safeParse<string[]>(raw, []);
}

export async function toggleSelectedClass(id: string): Promise<string[]> {
  const selected = await getSelectedClassIds();
  const exists = selected.includes(id);
  const updated = exists
    ? selected.filter((classId) => classId !== id)
    : [...selected, id];

  await AsyncStorage.setItem(SELECTED_CLASS_IDS_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearSelectedClasses() {
  await AsyncStorage.setItem(SELECTED_CLASS_IDS_KEY, JSON.stringify([]));
}

export async function getTransferPlans(): Promise<TransferPlan[]> {
  const raw = await AsyncStorage.getItem(TRANSFER_PLANS_KEY);
  return safeParse<TransferPlan[]>(raw, []);
}

export async function createTransferPlan(input: {
  university: string;
  program: string;
  status?: TransferPlan["status"];
}): Promise<TransferPlan | null> {
  const [classes, selectedIds, plans] = await Promise.all([
    getSavedClasses(),
    getSelectedClassIds(),
    getTransferPlans(),
  ]);

  const selectedClasses = classes.filter((item) => selectedIds.includes(item.id));
  if (selectedClasses.length === 0) {
    return null;
  }

  const uniqueColleges = [...new Set(selectedClasses.map((item) => item.sourceCollege))];

  const newPlan: TransferPlan = {
    id: makeId(),
    university: input.university.trim(),
    program: input.program.trim(),
    sourceCollege:
      uniqueColleges.length > 1 ? "Multiple Colleges" : uniqueColleges[0] ?? "N/A",
    credits: selectedClasses.reduce((sum, item) => sum + item.credits, 0),
    status: input.status ?? "Planned",
    classes: selectedClasses,
    createdAt: new Date().toISOString(),
  };

  const updatedPlans = [newPlan, ...plans];
  await AsyncStorage.setItem(TRANSFER_PLANS_KEY, JSON.stringify(updatedPlans));
  return newPlan;
}

export async function deleteTransferPlan(id: string): Promise<TransferPlan[]> {
  const plans = await getTransferPlans();
  const updated = plans.filter((plan) => plan.id !== id);
  await AsyncStorage.setItem(TRANSFER_PLANS_KEY, JSON.stringify(updated));
  return updated;
}

export async function getKnownInstitutions(): Promise<KnownInstitutions> {
  const [apiInstitutions, classes, plans] = await Promise.all([
    fetchInstitutionsFromApi(),
    getSavedClasses(),
    getTransferPlans(),
  ]);

  const apiSourceColleges = apiInstitutions || [];
  const savedSourceColleges = [...new Set(classes.map((item) => item.sourceCollege.trim()))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const sourceColleges = [
    ...new Set([...apiSourceColleges, ...savedSourceColleges]),
  ].sort((a, b) => a.localeCompare(b));

  const universities = [...new Set(plans.map((item) => item.university.trim()))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return {
    sourceColleges,
    universities,
  };
}

export async function getAllInstitutions(): Promise<string[]> {
  const apiInstitutions = await fetchInstitutionsFromApi();
  return apiInstitutions || [];
}
