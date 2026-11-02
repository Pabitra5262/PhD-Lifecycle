/**
 * `@mfe/components` for the wireframe project.
 *
 * Pages built here import from `@mfe/components` exactly like in hplus_react, so a feature folder can be
 * copied into hplus_react `apps/<app>/src/features/` without changes. Same names and props as hplus_react's
 * package; the wireframe's own components draw them. Only the parts the wireframe pages need are listed here —
 * add more the same way (same name and props as in hplus_react).
 */

// Same API in the wireframe already: re-exported as is
export { default as Card, CardHeader, CardBody, CardFooter, type CardProps, type CardHeaderProps } from "@/shared/components/layout/Card";
export { default as Modal, ModalFooter } from "@/shared/components/ui/Modal/Modal";
export { default as DialogModal } from "@/shared/components/ui/DialogModal/DialogModal";
export { default as StatusModal, type StatusModalType } from "@/shared/components/ui/StatusModal/StatusModal";
export { default as Stepper, type StepperStep, type StepperProps } from "@/shared/components/ui/Stepper/Stepper";
export { default as Tabs, type TabItem, type TabsProps } from "@/shared/components/ui/Tabs";
export { FormGenerator, Input, MultiStepForm, TextArea, DatePicker, TimePicker, Checkbox, UploadFile } from "@/shared/components/ui/Forms";
export { RadioGroup, type RadioGroupProps, type RadioOption } from "./RadioGroup";
export type { FormField, FormProps, Option, InputType, ValidationRule } from "@/shared/components/ui/Forms/form.types";
export { DynamicFormTable } from "@/shared/components/ui/Table";
export { useMouseDepth } from "@/shared/hooks/useMouseDepth";

// hplus_react API on top of the wireframe components
export { Button, type ButtonProps, type ButtonVariant, type ButtonAction, type ButtonSize } from "./Button";
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from "./Badge";
export { PageHeader, type PageHeaderProps, type BreadcrumbItem } from "./PageHeader";
export { Select, type SelectProps } from "./Select";
export {
    DataTable,
    DataTable as ReusableTable,
    type DataTableProps,
    type DataTableProps as ReusableTableProps,
    type TableColumnDef,
    type TableServerPagination,
    type TableSortState,
    type TableBulkAction,
    type TableMenuItem,
    type TableRowActions,
    type TableExportFormat,
    type TableFilterField,
} from "./DataTable";
export { FilterPanel, type FilterPanelProps } from "./FilterPanel";
export { useTableFilters } from "./useTableFilters";
export { showToast, toast } from "./toast";
export { useAppNavigate } from "./useAppNavigate";

// Extras from hims-ui-new (KpiCard, SummaryTile, ActivityTimeline, Alert, Progress). These do NOT exist in real
// hplus_react @mfe/components; see ./extras/index.ts.
export * from "./extras";
