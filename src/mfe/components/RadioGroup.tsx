import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import WireRadioGroup from "@/shared/components/ui/Forms/RadioGroup/RadioGroup";

/* hplus_react `@mfe/components` RadioGroup API: `direction` 'horizontal' (default) | 'vertical', drawn with the wireframe RadioGroup. */

export interface RadioOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    /** Smaller grey line under the label. */
    description?: string;
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
    label?: string;
    options: RadioOption[];
    error?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    helpText?: string;
    value?: string | number | boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /** 'horizontal' (default): options in a wrapping row. 'vertical': one option per line. */
    direction?: "horizontal" | "vertical";
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup({ direction = "horizontal", value, defaultValue, ...rest }, ref) {
    return <WireRadioGroup ref={ref} {...rest} value={typeof value === "boolean" ? String(value) : value} defaultValue={typeof defaultValue === "string" || typeof defaultValue === "number" ? defaultValue : undefined} orientation={direction} />;
});

export default RadioGroup;
