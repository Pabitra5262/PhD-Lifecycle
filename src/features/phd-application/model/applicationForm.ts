import type { ApplicationForm } from "../types/application.types";

export const emptyApplication = (advertisement = ""): ApplicationForm => ({ advertisement, researchArea: "", synopsis: "", synopsisFile: null, documents: {}, eligibilityConfirmed: false, declaration: false });
