import type { FormField, Option } from "@/shared/components/ui/Forms";
export type Values = Record<string, unknown>;
export interface Actor { sourceRole?: string; role: string; userId: string; universities: string[]; departments: string[]; scholarIds: string[] }
export interface Scholar { id: string; name: string; university: string; department: string; session: string; level: number; supervisor: string; registrationDate?: string; extensionYears?: number }
export interface GridColumn { name: string; label: string; type?: "text" | "number" | "date" | "select"; options?: Option[]; source?: string; required?: boolean }
export interface GridDefinition { name: string; label: string; columns: GridColumn[]; mode: "display" | "editable" | "enrollment" | "checklist"; required?: boolean }
export interface Definition { key: string; title: string; feature: string; uc: number; path: string; menu: string[]; roles: string[]; writers: string[]; columns: { name: string; label: string }[]; grids: GridDefinition[]; readOnly?: boolean }
export interface RecordRow { id: string; university: string; department: string; scholarId: string; owner: string; status: string; values: Values; grids: Record<string, Values[]>; date: string; archived?: boolean }
export interface FieldContext { actor: Actor; values: Values; scholars: Scholar[]; options: Record<string, Option[]>; fields?: FormField[] }
export interface FeatureService { read: (actor: Actor) => RecordRow[]; save: (actor: Actor, values: Values, grids: Record<string, Values[]>, fields: FormField[], id?: string) => RecordRow; generate?: (actor: Actor, values: Values) => RecordRow[]; changeAccountStatus?: (actor: Actor, id: string, active: boolean) => RecordRow; approveNomination?: (actor: Actor, id: string) => RecordRow }
