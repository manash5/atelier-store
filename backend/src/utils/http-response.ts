import type { ApiSuccess, PaginationMeta } from "../dtos/common.dto";
import type { Response } from "express";

/** Sends the standard success envelope. */
export function sendOk<T>(res: Response, data: T): void;
export function sendOk<T>(res: Response, data: T, meta: PaginationMeta): void;
export function sendOk<T>(res: Response, data: T, meta?: PaginationMeta): void {
  const body: ApiSuccess<T> | ApiSuccess<T, PaginationMeta> =
    meta === undefined ? { data } : { data, meta };
  res.status(200).json(body);
}
