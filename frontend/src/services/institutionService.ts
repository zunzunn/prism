import {
  InstitutionDetailRecord,
  InstitutionFilterParams,
} from "../types/institutions";
import { MOCK_INSTITUTIONS } from "../data/institutionsData";

export interface PaginatedInstitutionsResult {
  institutions: InstitutionDetailRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const fetchInstitutions = async (
  params: InstitutionFilterParams = {}
): Promise<PaginatedInstitutionsResult> => {
  // Simulate network latency (150ms)
  await new Promise((resolve) => setTimeout(resolve, 150));

  let filtered = [...MOCK_INSTITUTIONS];

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q) ||
        inst.district.toLowerCase().includes(q)
    );
  }

  // State filter
  if (params.state && params.state !== "All" && params.state !== "All States / UTs") {
    filtered = filtered.filter((inst) => inst.state === params.state);
  }

  // Status filter
  if (params.status && params.status !== "All") {
    filtered = filtered.filter((inst) => inst.status === params.status);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    institutions: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const fetchInstitutionById = async (
  idOrCode: string
): Promise<InstitutionDetailRecord | null> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const found = MOCK_INSTITUTIONS.find(
    (inst) => inst.id === idOrCode || inst.code === idOrCode
  );
  return found || null;
};
