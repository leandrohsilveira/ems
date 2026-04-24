import { assert, createEnum, error } from "@ems/utils";
import { Prisma } from "./gen/client.js";

/**
 * @import { ResultFailure, ResultError } from "@ems/utils"
 */

export const DatabaseRequestFailures = createEnum({
  COLUMN_TOO_LONG: "COLUMN_TOO_LONG",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  UNIQUE_CONSTRAINT_FAILED: "UNIQUE_CONSTRAINT_FAILED",
  FOREIGN_KEY_CONSTRAINT_FAILED: "FOREIGN_KEY_CONSTRAINT_FAILED",
  CONSTRAINT_FAILED: "CONSTRAINT_FAILED",
  INVALID_FIELD_VALUE: "INVALID_FIELD_VALUE",
  INVALID_PROVIDED_VALUE: "INVALID_PROVIDED_VALUE",
  DATA_VALIDATION_ERROR: "DATA_VALIDATION_ERROR",
  QUERY_PARSE_FAILED: "QUERY_PARSE_FAILED",
  QUERY_VALIDATION_FAILED: "QUERY_VALIDATION_FAILED",
  RAW_QUERY_FAILED: "RAW_QUERY_FAILED",
  NULL_CONSTRAINT_VIOLATION: "NULL_CONSTRAINT_VIOLATION",
  MISSING_REQUIRED_VALUE: "MISSING_REQUIRED_VALUE",
  MISSING_REQUIRED_ARGUMENT: "MISSING_REQUIRED_ARGUMENT",
  REQUIRED_RELATION_VIOLATION: "REQUIRED_RELATION_VIOLATION",
  RELATED_RECORD_NOT_FOUND: "RELATED_RECORD_NOT_FOUND",
  QUERY_INTERPRETATION_ERROR: "QUERY_INTERPRETATION_ERROR",
  RELATION_NOT_CONNECTED: "RELATION_NOT_CONNECTED",
  REQUIRED_CONNECTED_RECORDS_NOT_FOUND: "REQUIRED_CONNECTED_RECORDS_NOT_FOUND",
  INPUT_ERROR: "INPUT_ERROR",
  VALUE_OUT_OF_RANGE: "VALUE_OUT_OF_RANGE",
  TABLE_NOT_FOUND: "TABLE_NOT_FOUND",
  COLUMN_NOT_FOUND: "COLUMN_NOT_FOUND",
  INCONSISTENT_COLUMN_DATA: "INCONSISTENT_COLUMN_DATA",
  CONNECTION_POOL_TIMEOUT: "CONNECTION_POOL_TIMEOUT",
  REQUIRED_RECORDS_NOT_FOUND: "REQUIRED_RECORDS_NOT_FOUND",
  UNSUPPORTED_FEATURE: "UNSUPPORTED_FEATURE",
  MULTIPLE_DATABASE_ERRORS: "MULTIPLE_DATABASE_ERRORS",
});

export const databaseKnownRequestErrorsMap = {
  P2000: DatabaseRequestFailures.COLUMN_TOO_LONG,
  P2001: DatabaseRequestFailures.RECORD_NOT_FOUND,
  P2002: DatabaseRequestFailures.UNIQUE_CONSTRAINT_FAILED,
  P2003: DatabaseRequestFailures.FOREIGN_KEY_CONSTRAINT_FAILED,
  P2004: DatabaseRequestFailures.CONSTRAINT_FAILED,
  P2005: DatabaseRequestFailures.INVALID_FIELD_VALUE,
  P2006: DatabaseRequestFailures.INVALID_PROVIDED_VALUE,
  P2007: DatabaseRequestFailures.DATA_VALIDATION_ERROR,
  P2008: DatabaseRequestFailures.QUERY_PARSE_FAILED,
  P2009: DatabaseRequestFailures.QUERY_VALIDATION_FAILED,
  P2010: DatabaseRequestFailures.RAW_QUERY_FAILED,
  P2011: DatabaseRequestFailures.NULL_CONSTRAINT_VIOLATION,
  P2012: DatabaseRequestFailures.MISSING_REQUIRED_VALUE,
  P2013: DatabaseRequestFailures.MISSING_REQUIRED_ARGUMENT,
  P2014: DatabaseRequestFailures.REQUIRED_RELATION_VIOLATION,
  P2015: DatabaseRequestFailures.RELATED_RECORD_NOT_FOUND,
  P2016: DatabaseRequestFailures.QUERY_INTERPRETATION_ERROR,
  P2017: DatabaseRequestFailures.RELATION_NOT_CONNECTED,
  P2018: DatabaseRequestFailures.REQUIRED_CONNECTED_RECORDS_NOT_FOUND,
  P2019: DatabaseRequestFailures.INPUT_ERROR,
  P2020: DatabaseRequestFailures.VALUE_OUT_OF_RANGE,
  P2021: DatabaseRequestFailures.TABLE_NOT_FOUND,
  P2022: DatabaseRequestFailures.COLUMN_NOT_FOUND,
  P2023: DatabaseRequestFailures.INCONSISTENT_COLUMN_DATA,
  P2024: DatabaseRequestFailures.CONNECTION_POOL_TIMEOUT,
  P2025: DatabaseRequestFailures.REQUIRED_RECORDS_NOT_FOUND,
  P2026: DatabaseRequestFailures.UNSUPPORTED_FEATURE,
  P2027: DatabaseRequestFailures.MULTIPLE_DATABASE_ERRORS,
};

/**
 * @param {unknown} err
 * @returns {string | null}
 */
export function getErrorCode(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code;
  }
  return null;
}

/**
 * @param {unknown} err
 * @returns {(keyof typeof DatabaseRequestFailures) | null}
 */
export function getDatabaseFailure(err) {
  const code = getErrorCode(err);
  if (code) return databaseKnownRequestErrorsMap[code] ?? null;
  return null;
}

/**
 * @template {string} Code
 * @param {unknown} err
 * @param {(failure: keyof typeof DatabaseRequestFailures) => ResultFailure<Code> | undefined} handler
 * @returns {Promise<ResultFailure<Code> | ResultError>}
 */
export async function handleDatabaseError(err, handler) {
  const code = getDatabaseFailure(err);
  if (code) {
    const result = handler(code);
    if (result) return result;
  }
  return error(err);
}
