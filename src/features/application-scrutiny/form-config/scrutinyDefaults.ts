import type { PhdApplication } from "@/features/phd-application/types/application.types";
import type { ScrutinyForm } from "../types";

export const emptyScrutiny = (application: PhdApplication): ScrutinyForm => ({ netVerification: "", documents: {}, remarks: "", decision: "", revision: application.scrutinyHistory?.length ?? 0 });
