import { FormProvider } from "react-hook-form";
import { Card, CardBody, CardHeader, Checkbox, DynamicFormTable, FormGenerator, Input } from "@mfe/components";
import { Button } from "@/shared/components/ui/Button";
import { ArrowRight, RotateCcw } from "lucide-react";
import { SearchableSelect as Select } from "@/shared/components/ui/Forms";
import { STAGES, stageTableHeaders } from "../form-config/selectionConfigurationConfig";
import { SELECTION_CONFIGURATION_FIELDS, selectionRuleFields } from "../form-config/selectionConfiguration.fields";
import type { SelectionConfigurationViewProps } from "../types";

export function SelectionConfigurationCard({ controller }: SelectionConfigurationViewProps) {
    const { methods, selectedRecord, locked, form, errors, weighted, scoredStages, toggleStage, changeStage, save, changeUniversity, resetForm } = controller;
    const ruleFields = selectionRuleFields(form, locked);
    const cell = "border border-table-border p-2";
    return <>
        <FormProvider {...methods}>
            <fieldset disabled={locked}>
            <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); save(); }}>
                <Card>
                    <CardHeader title="Selection Configuration" divider />
                    <CardBody>
                    <FormGenerator standalone gridColumns={12} fields={SELECTION_CONFIGURATION_FIELDS.map((field) => ({
                        ...field,
                        disabled: locked,
                        ...(field.name === "status" ? { render: () => <Input wrapperClassName="col-span-12 sm:col-span-6 md:col-span-4 min-w-0" label="Approval Status" value={selectedRecord?.status ?? form.status} readOnly /> } : {}),
                        ...(field.name === "university" ? { render: () => <Select wrapperClassName="col-span-12 sm:col-span-6 md:col-span-4 min-w-0" label="University" disabled={locked} required value={form.university} options={field.options} error={errors.university} onChange={changeUniversity} /> } : {}),
                    }))} onSubmit={() => undefined} />
                    <fieldset className="mt-4">
                        <legend className="ui-label">Selection Stage<span className="ui-required">*</span></legend>
                        <div className="flex flex-wrap gap-4">{STAGES.map((stage) => <Checkbox key={stage.id} label={stage.label} checked={form.stages.some((item) => item.id === stage.id)} onChange={(event) => toggleStage(stage.id, event.target.checked)} />)}</div>
                        {errors.stages && <p className="ui-error" role="alert">{errors.stages}</p>}
                    </fieldset>
                    </CardBody>
                    <CardHeader title="Stage Configuration" divider />
                    <CardBody>
                    <DynamicFormTable rows={form.stages} showAction={false} headers={stageTableHeaders} renderRow={(index) => {
                        const stage = form.stages[index];
                        const label = STAGES.find((item) => item.id === stage.id)!.label;
                        const error = (key: string) => errors[`stages.${index}.${key}`];
                        return <>
                            <td className={cell}>{label}</td>
                            <td className={cell}><Input aria-label={`${label} order`} type="number" min={1} max={form.stages.length} step={1} required value={stage.order} error={error("order")} onChange={(event) => changeStage(index, { order: event.target.value })} /></td>
                            <td className={cell}><Checkbox label="Applicable" checked={stage.scored} onChange={(event) => changeStage(index, { scored: event.target.checked })} /></td>
                            <td className={cell}><Input aria-label={`${label} maximum marks`} type="number" min={0.01} step="any" disabled={!stage.scored} required={stage.scored} value={stage.marks} error={error("marks")} onChange={(event) => changeStage(index, { marks: event.target.value })} /></td>
                            <td className={cell}><Input aria-label={`${label} weightage`} type="number" min={0.01} max={100} step="any" disabled={!weighted || !stage.scored} required={weighted && stage.scored} value={stage.weightage} error={error("weightage")} onChange={(event) => changeStage(index, { weightage: event.target.value })} /></td>
                            <td className={cell}><Input aria-label={`${label} qualifying score`} type="number" min={0} max={Number(stage.marks) || undefined} step="any" disabled={!stage.scored} required={stage.scored} value={stage.qualifyingScore} error={error("qualifyingScore")} onChange={(event) => changeStage(index, { qualifyingScore: event.target.value })} /></td>
                        </>;
                    }} />
                    {weighted && <p className="mt-3 text-sm" role="status">Total Weightage: {scoredStages.reduce((total, stage) => total + (Number(stage.weightage) || 0), 0)} / 100%</p>}
                    {errors.weightage && <p className="ui-error" role="alert">{errors.weightage}</p>}
                    </CardBody>
                    <CardHeader title="Merit Rule" divider />
                    <CardBody>
                    <FormGenerator standalone gridColumns={12} fields={ruleFields.merit} onSubmit={() => undefined} />
                    </CardBody>
                    <CardHeader title="Exemption Rule" divider />
                    <CardBody>
                    <FormGenerator standalone gridColumns={12} fields={ruleFields.exemption} onSubmit={() => undefined} />
                    <div className="mt-5 flex flex-wrap items-center justify-start gap-4 border-t border-border pt-5">
                        <Button type="button" variant="outline" size="lg" leftIcon={RotateCcw} label="Reset" onClick={resetForm} disabled={locked} />
                        <Button type="submit" variant="primary" size="lg" rightIcon={ArrowRight} label="Submit" disabled={locked} />
                    </div>
                    </CardBody>
                </Card>
            </form>
            </fieldset>
        </FormProvider>
    </>;
}
