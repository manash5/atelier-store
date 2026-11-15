import type { PaginationMeta } from "../dtos/common.dto";

/** A page of results as returned by services. */
export type Page<T> = {
  items: T[];
  meta: PaginationMeta;
};
