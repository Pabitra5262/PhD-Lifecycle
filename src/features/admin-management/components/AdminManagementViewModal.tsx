import { FormProvider, useForm } from "react-hook-form";
import { FormGenerator, Input, Modal, ModalFooter } from "@mfe/components";
import type { LifecycleController } from "@/features/lifecycle-shared/hooks/useLifecyclePage";
import type { RecordRow, Values } from "@/features/lifecycle-shared/types";
import { recordOptions } from "@/features/lifecycle-shared/service/lifecycleStore";
import { adminManagementFields } from "../form-config/adminManagement.fields";

interface Props {
    record: RecordRow | null;
    controller: LifecycleController;
    onClose: () => void;
}

function AccountDetails({ record, controller }: { record: RecordRow; controller: LifecycleController }) {
    const form = useForm<Values>({ defaultValues: record.values });
    const fields = adminManagementFields({
        ...controller.context,
        values: record.values,
        options: recordOptions(controller.actor, controller.def.key, record.values),
    }).map((field) => ({ ...field, disabled: true }));

    return (
        <FormProvider {...form}>
            <fieldset disabled>
                <FormGenerator standalone fields={fields} gridColumns={12} onSubmit={() => undefined} />
                <div className="mt-4 grid grid-cols-12 gap-4">
                    <Input label="Status" value={record.status} readOnly wrapperClassName="col-span-12 sm:col-span-3" />
                </div>
            </fieldset>
        </FormProvider>
    );
}

export function AdminManagementViewModal({ record, controller, onClose }: Props) {
    return (
        <Modal isOpen={record !== null} title="View User Account" onClose={onClose} size="4xl"
            footer={<ModalFooter onClose={onClose} cancelText="Close" showConfirm={false} />}>
            {record && <AccountDetails key={record.id} record={record} controller={controller} />}
        </Modal>
    );
}
