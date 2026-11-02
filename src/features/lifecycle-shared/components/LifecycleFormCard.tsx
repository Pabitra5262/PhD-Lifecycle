import { FormProvider } from "react-hook-form";
import { ArrowRight, Download, Eye, Filter, RotateCcw } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  DatePicker,
  DynamicFormTable,
  FormGenerator,
  Input,
} from "@mfe/components";
import { SearchableSelect } from "@/shared/components/ui/Forms";
import type { LifecycleController } from "../hooks/useLifecyclePage";
import { documentFile } from "../service/lifecycleStore";

export function LifecycleFormCard({
  controller: c,
}: {
  controller: LifecycleController;
}) {
  if (c.def.readOnly && c.def.key !== "reportsAnalytics") return null;
  if (c.def.key === "reportsAnalytics")
    return (
      <Card>
        <CardHeader title="Report Filters" divider />
        <CardBody>
          <FormProvider {...c.methods}>
            <form noValidate onSubmit={c.submit}>
              <FormGenerator
                standalone
                gridColumns={12}
                fields={c.fields}
                onSubmit={() => undefined}
              />
              <div className="mt-5 flex justify-start gap-2 border-t border-border pt-5">
                <Button
                  icon={<RotateCcw size={16} />}
                  type="button"
                  variant="outline"
                  label="Reset"
                  onClick={c.reset}
                />
                <Button
                  icon={<Filter size={16} />}
                  type="submit"
                  label="Generate Report"
                />
              </div>
            </form>
          </FormProvider>
        </CardBody>
      </Card>
    );
  const cell = "border border-table-border p-2";
  const download = () => {
    if (!c.viewed || !c.viewed.values.certificateNumber) return;
    const url = URL.createObjectURL(
      documentFile(String(c.viewed.values.certificateNumber)),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download =
      String(c.viewed.values.certificateNumber).replaceAll("/", "_") + ".pdf";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card>
      <CardHeader title={c.def.title} divider />
      <CardBody>
        <FormProvider {...c.methods}>
          <form noValidate onSubmit={c.submit}>
            <FormGenerator
              standalone
              gridColumns={12}
              fields={c.fields}
              onSubmit={() => undefined}
            />
            {c.def.grids.map((grid) => (
              <section className="mt-5" key={grid.name}>
                <h3 className="mb-3 font-semibold">
                  {grid.label}
                  {grid.required && <span className="ui-required">*</span>}
                </h3>
                <DynamicFormTable
                  rows={c.displayRows(grid.name)}
                  headers={[
                    ...(grid.mode === "enrollment" ? ["Enroll"] : []),
                    ...grid.columns.map((column) => column.label),
                    ...(grid.name === "candidateList" ? ["Action"] : []),
                  ]}
                  showAction={
                    grid.mode === "editable" &&
                    !c.locked &&
                    !(
                      c.def.key === "examinerManagement" &&
                      c.actor.role === "Thesis Examiner"
                    )
                  }
                  disableAddRemove={c.locked}
                  onAdd={() =>
                    c.setGrids((current) => ({
                      ...current,
                      [grid.name]: [
                        ...(current[grid.name] ?? []),
                        Object.fromEntries(
                          grid.columns.map((column) => [column.name, ""]),
                        ),
                      ],
                    }))
                  }
                  onRemove={(index) =>
                    c.setGrids((current) => ({
                      ...current,
                      [grid.name]: (current[grid.name] ?? []).filter(
                        (_, i) => i !== index,
                      ),
                    }))
                  }
                  renderRow={(index) => {
                    const row = c.displayRows(grid.name)[index];
                    return (
                      <>
                        {grid.mode === "enrollment" && (
                          <td className={cell}>
                            <Checkbox
                              label="Enroll"
                              disabled={c.locked}
                              checked={(c.grids[grid.name] ?? []).some(
                                (item) => item.scholar === row.scholar,
                              )}
                              onChange={(event) =>
                                c.setGrids((current) => ({
                                  ...current,
                                  [grid.name]: event.target.checked
                                    ? [...(current[grid.name] ?? []), row]
                                    : (current[grid.name] ?? []).filter(
                                        (item) => item.scholar !== row.scholar,
                                      ),
                                }))
                              }
                            />
                          </td>
                        )}
                        {grid.columns.map((column) => (
                          <td className={cell} key={column.name}>
                            {(grid.mode === "editable" ||
                              (grid.mode === "enrollment" &&
                                column.type === "select")) &&
                            !c.locked ? (
                              column.type === "select" ? (
                                <SearchableSelect
                                  aria-label={column.label + " " + (index + 1)}
                                  required={column.required}
                                  disabled={
                                    grid.mode === "enrollment" &&
                                    !(c.grids[grid.name] ?? []).some(
                                      (item) => item.scholar === row.scholar,
                                    )
                                  }
                                  options={
                                    column.source
                                      ? c.context.options[column.source]
                                      : column.options
                                  }
                                  value={String(row[column.name] ?? "")}
                                  onChange={(value) =>
                                    c.updateGrid(
                                      grid.name,
                                      index,
                                      column.name,
                                      value,
                                    )
                                  }
                                />
                              ) : column.type === "date" ? (
                                <DatePicker
                                  id={
                                    grid.name + "-" + column.name + "-" + index
                                  }
                                  name={
                                    grid.name + "." + index + "." + column.name
                                  }
                                  label={column.label + " " + (index + 1)}
                                  labelClassName="sr-only"
                                  value={String(row[column.name] ?? "")}
                                  required={column.required}
                                  error={
                                    c.errors[
                                      grid.name +
                                        "." +
                                        index +
                                        "." +
                                        column.name
                                    ]
                                  }
                                  onChange={(event) =>
                                    c.updateGrid(
                                      grid.name,
                                      index,
                                      column.name,
                                      event.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <Input
                                  aria-label={column.label + " " + (index + 1)}
                                  type={column.type ?? "text"}
                                  value={String(row[column.name] ?? "")}
                                  required={column.required}
                                  error={
                                    c.errors[
                                      grid.name +
                                        "." +
                                        index +
                                        "." +
                                        column.name
                                    ]
                                  }
                                  onChange={(event) =>
                                    c.updateGrid(
                                      grid.name,
                                      index,
                                      column.name,
                                      event.target.value,
                                    )
                                  }
                                />
                              )
                            ) : (
                              String(row[column.name] ?? "")
                            )}
                          </td>
                        ))}
                        {grid.name === "candidateList" && (
                          <td className={cell}>
                            <Button
                              icon={<Eye size={16} />}
                              type="button"
                              variant="outline"
                              label="Select"
                              onClick={() =>
                                c.methods.setValue("candidate", row.candidateId)
                              }
                            />
                          </td>
                        )}
                      </>
                    );
                  }}
                />
                {c.errors[grid.name] && (
                  <p role="alert" className="ui-error">
                    {c.errors[grid.name]}
                  </p>
                )}
              </section>
            ))}
            <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-5">
              <Button
                icon={<RotateCcw size={16} />}
                type="button"
                variant="outline"
                label="Reset"
                onClick={c.reset}
              />
              <Button
                icon={<ArrowRight size={16} />}
                type="submit"
                label="Submit"
                disabled={c.locked}
              />
              {c.def.key === "courseworkExams" && (
                <Button
                  icon={<Download size={16} />}
                  type="button"
                  variant="outline"
                  label="Download Certificate"
                  disabled={!c.viewed?.values.certificateNumber}
                  onClick={download}
                />
              )}
            </div>
          </form>
        </FormProvider>
      </CardBody>
    </Card>
  );
}
