// Compatibility exports; implementation lives in service, types and validation.
export * from "../service/applicationService";
export type * from "../types/application.types";
export { fileProblem } from "../validation/applicationValidation";
export { emptyApplication } from "./applicationForm";
