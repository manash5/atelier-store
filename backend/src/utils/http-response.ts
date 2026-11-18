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

/** Sends the standard success envelope with 201 Created. */
export function sendCreated<T>(res: Response, data: T): void {
  const body: ApiSuccess<T> = { data };
  res.status(201).json(body);
}
