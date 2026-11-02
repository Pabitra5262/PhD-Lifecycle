import type { FormField } from "@/shared/components/ui/Forms";

const FIELD_SPANS: Record<number, string> = {
    2: "col-span-12 sm:col-span-6 lg:col-span-2",
    3: "col-span-12 sm:col-span-6 lg:col-span-3",
    4: "col-span-12 sm:col-span-6 lg:col-span-4",
    6: "col-span-12 lg:col-span-6",
    8: "col-span-12 lg:col-span-8",
    12: "col-span-12",
};

/** Applies feature field metadata to existing controlled inputs without changing shared controls. */
export function configuredFieldProps(field: FormField) {
    const { gridColumn = 4 } = field;
    return {
        label: field.label ?? "",
        required: field.required ?? false,
        readOnly: field.readOnly ?? false,
        wrapperClassName: [FIELD_SPANS[gridColumn] ?? FIELD_SPANS[4], field.wrapperClassName].filter(Boolean).join(" "),
    };
}
