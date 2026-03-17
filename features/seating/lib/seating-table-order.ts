import type {
  SeatingTableView,
  WeddingTableRecord,
} from "@/lib/planner-domain";

const normalizeTableName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .trim()
    .toLowerCase();

export const getTableDisplayName = (tableName: string) => {
  const normalized = normalizeTableName(tableName);
  if (normalized.includes("nowozen")) {
    return "Stół nowożeńców";
  }

  const numberMatch = tableName.match(/(\d+)/);
  if (numberMatch) {
    return `Stół ${numberMatch[1]}`;
  }

  return tableName;
};

export const getTableSortOrder = (tableName: string) => {
  const normalized = normalizeTableName(tableName);
  if (normalized.includes("nowozen")) {
    return 0;
  }

  const numberMatch = normalized.match(/(\d+)/);
  return numberMatch
    ? Number.parseInt(numberMatch[1]!, 10) + 1
    : Number.MAX_SAFE_INTEGER;
};

export const sortWeddingTables = <
  T extends WeddingTableRecord | SeatingTableView,
>(
  tables: T[],
) =>
  [...tables].sort((left, right) => {
    const sortDelta =
      getTableSortOrder(left.name) - getTableSortOrder(right.name);
    if (sortDelta !== 0 || Number.isFinite(sortDelta)) {
      return sortDelta;
    }
    return 0;
  });
