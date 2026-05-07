import AsyncStorage from "@react-native-async-storage/async-storage";

const CLASSES_KEY = "transferme:classes";
const SELECTED_CLASS_IDS_KEY = "transferme:selected-class-ids";
const TRANSFER_PLANS_KEY = "transferme:transfer-plans";

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
  return safeParse<SavedClass[]>(raw, []);
}

export async function addSavedClass(input: {
  code: string;
  title: string;
  credits: number;
  sourceCollege: string;
}): Promise<SavedClass[]> {
  const existing = await getSavedClasses();

  const newClass: SavedClass = {
    id: makeId(),
    code: input.code.trim().toUpperCase(),
    title: input.title.trim(),
    credits: input.credits,
    sourceCollege: input.sourceCollege.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated = [newClass, ...existing];
  await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(updated));
  return updated;
}

export async function removeSavedClass(id: string): Promise<{
  classes: SavedClass[];
  selectedIds: string[];
}> {
  const existing = await getSavedClasses();
  const updatedClasses = existing.filter((item) => item.id !== id);
  await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(updatedClasses));

  const selectedIds = await getSelectedClassIds();
  const updatedSelectedIds = selectedIds.filter((classId) => classId !== id);
  await AsyncStorage.setItem(
    SELECTED_CLASS_IDS_KEY,
    JSON.stringify(updatedSelectedIds)
  );

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
