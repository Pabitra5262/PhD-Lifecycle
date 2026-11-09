import { FormProvider, useForm } from "react-hook-form";
import { FormGenerator, Input, Modal, ModalFooter } from "@mfe/components";
import { configuredFieldProps } from "@/features/shared/formFields";
import { advertisementFields } from "../form-config/advertisement.fields";
import { CONTROL_FIELDS } from "../form-config/advertisementFilters.fields";
import type { AdvertisementForm } from "../form-config/advertisementConfig";
import type { AdvertisementRecord } from "../model/advertisementRecords";

function AdvertisementDetails({ record }: { record: AdvertisementRecord }) {
    const form = useForm<AdvertisementForm>({ defaultValues: record.form });
    const fields = advertisementFields(record.form).map((field) => ({ ...field, disabled: true }));
    return (
        <FormProvider {...form}>
            <fieldset disabled>
                <FormGenerator standalone fields={fields} gridColumns={12} onSubmit={() => undefined} />
                <div className="mt-4 grid grid-cols-12 gap-4">
                    <Input {...configuredFieldProps(CONTROL_FIELDS.statusDisplay)} value={record.status} />
                </div>
            </fieldset>
        </FormProvider>
    );
}

export function AdvertisementViewModal({ record, onClose }: { record: AdvertisementRecord | null; onClose: () => void }) {
    return (
        <Modal isOpen={record !== null} title="View Advertisement" onClose={onClose} size="6xl"
            footer={<ModalFooter onClose={onClose} cancelText="Close" showConfirm={false} />}>
            {record && <AdvertisementDetails key={record.id} record={record} />}
        </Modal>
    );
}
