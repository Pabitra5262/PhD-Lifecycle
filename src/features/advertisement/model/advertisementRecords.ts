import { advertisementSchema, localToday, type AdvertisementForm } from "../form-config/advertisementConfig";

export const ADVERTISEMENT_STATUSES = ["Draft", "Submitted", "Approved", "Published", "Closed", "Cancelled"] as const;
export type AdvertisementStatus = typeof ADVERTISEMENT_STATUSES[number];
export interface AdvertisementRecord { id: string; form: AdvertisementForm; status: AdvertisementStatus; history: { action: string; date: string; role: string }[] }
const records: AdvertisementRecord[] = [];
const clone = (row: AdvertisementRecord): AdvertisementRecord => ({ ...row, form: { ...row.form, permittedExemptions: [...row.form.permittedExemptions] }, history: row.history.map((event) => ({ ...event })) });
export const readAdvertisementRecords = () => records.map(clone);
export const saveAdvertisementRecord = (form: AdvertisementForm, role: string) => {
    if (role !== "University Authority") throw new Error("Advertisement management permission is required.");
    const validated = advertisementSchema.parse(form);
    let record = records.find((row) => row.form.advertisementNumber === validated.advertisementNumber);
    if (record && record.status !== "Draft") throw new Error("Only draft advertisements can be edited.");
    if (!record) { record = { id: crypto.randomUUID(), form: validated, status: "Draft", history: [] }; records.push(record); }
    record.form = validated;
    record.history.push({ action: "Draft saved", date: new Date().toISOString(), role });
    return clone(record);
};
export const transitionAdvertisement = (id: string, next: AdvertisementStatus, role: string) => {
    if (role !== "University Authority") throw new Error("Advertisement management permission is required.");
    const record = records.find((row) => row.id === id);
    const allowed: Record<AdvertisementStatus, AdvertisementStatus[]> = { Draft: ["Submitted", "Cancelled"], Submitted: ["Approved", "Cancelled"], Approved: ["Published", "Cancelled"], Published: ["Closed"], Closed: [], Cancelled: [] };
    if (!record || !allowed[record.status].includes(next)) throw new Error("This status transition is not permitted.");
    if (["Submitted", "Approved", "Published"].includes(next)) advertisementSchema.parse(record.form);
    record.status = next;
    record.history.push({ action: next, date: new Date().toISOString(), role });
    return clone(record);
};

// Five local wireframe examples using the existing active Utkal selection configuration.
for (let index = 0; index < 5; index++) {
    const status = ADVERTISEMENT_STATUSES[index];
    const date = localToday();
    const end = new Date(`${date}T12:00:00`); end.setDate(end.getDate() + 30);
    const start = new Date(`${date}T12:00:00`); start.setDate(start.getDate() - 1);
    const iso = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    const pdf = new File(["%PDF-1.4\n% PhD admission advertisement"], `PhD_Admission_2027-28_${["Computer_Science", "Physics", "Chemistry"][index % 3]}_${String(index + 1).padStart(3, "0")}.pdf`, { type: "application/pdf" });
    records.push({ id: `ADV-DEMO-${index + 1}`, status, history: [{ action: `Advertisement record loaded: ${status}`, date: new Date().toISOString(), role: "University Authority" }], form: {
        advertisementNumber: `PHD/ADV/2027/00${index + 1}`, advertisementDate: date, academicSession: "2027-28", university: "utkal",
        department: ["Computer Science", "Physics", "Chemistry"][index % 3], researchArea: ["Artificial Intelligence", "Quantum Optics", "Materials Chemistry", "Data Science", "Condensed Matter Physics"][index],
        seatsApplicable: true, seats: String(index + 2), eligibilityCriteria: "Relevant postgraduate qualification as per approved university rules.",
        qualificationRule: "net-uret", permittedExemptions: [], applicationStart: iso(start), applicationEnd: iso(end), selectionProcess: "SC-DEMO-001", advertisementDocument: pdf, supportingDocument: null, status: "Draft",
    } });
}
