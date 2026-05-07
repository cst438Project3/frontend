import { API_BASE_URL } from "@/src/constants/api";

export type Institution = {
  id: string;
  name: string;
  code?: string;
};

const normalizeInstitution = (item: any, index: number): Institution => {
  const id = String(item?.id ?? item?.institutionId ?? index);
  const name = String(item?.name ?? item?.institutionName ?? item?.schoolName ?? "Unknown School");
  const code = item?.code ? String(item.code) : undefined;

  return { id, name, code };
};

export const fetchInstitutions = async (): Promise<Institution[]> => {
  const response = await fetch(`${API_BASE_URL}/api/institutions`);

  if (!response.ok) {
    throw new Error(`Failed to load institutions (${response.status})`);
  }

  const payload = await response.json();
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.institutions)
        ? payload.institutions
        : [];

  return rawList.map(normalizeInstitution);
};
