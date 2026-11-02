import { today } from "@/features/candidate-profile/model/candidateProfile";

import type { AdmissionAdvertisement } from "../types/advertisement.types";

const offsetDay = (offset: number) => {
    const date = new Date(`${today()}T12:00:00`); date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
// Published sample advertisements for the wireframe. Management drafts are never listed here.
const advertisements: AdmissionAdvertisement[] = [
    { id: "PHD-DEMO-CS", number: "PHD/ADM/2027/001", title: "PhD Admission - Computer Science", university: "utkal", department: "Computer Science", academicSession: "2027-28", published: true, status: "Published", starts: offsetDay(-7), ends: offsetDay(30), researchAreas: ["Artificial Intelligence", "Data Science", "Cyber Security"], eligibility: "Master's qualification with at least 55% marks; NET or URET qualification required.", minimumAcademicPercent: 55, requirement: "NET or URET", netExemptFromUret: false, synopsis: "Text or File", documents: [{ id: "cv", label: "Academic CV", required: true }], fee: 0, exemptCategories: [], selectionConfigurationId: "SC-DEMO-001" },
    { id: "PHD-DEMO-PHYSICS", number: "PHD/ADM/2027/002", title: "PhD Admission - Physics", university: "utkal", department: "Physics", academicSession: "2027-28", published: true, status: "Published", starts: offsetDay(-3), ends: offsetDay(45), researchAreas: ["Condensed Matter Physics", "Quantum Optics"], eligibility: "Master's qualification with at least 55% marks; URET required. NET-qualified candidates are exempt from URET.", minimumAcademicPercent: 55, requirement: "URET", netExemptFromUret: true, synopsis: "File", documents: [{ id: "cv", label: "Academic CV", required: true }, { id: "statement", label: "Statement of Purpose", required: true }], fee: 1000, exemptCategories: ["SC", "ST"], selectionConfigurationId: "SC-DEMO-001" },
    { id: "PHD-DEMO-CLOSED", number: "PHD/ADM/2026/003", title: "Previous PhD Admission", university: "utkal", department: "Chemistry", academicSession: "2026-27", published: true, status: "Closed", starts: offsetDay(-60), ends: offsetDay(-1), researchAreas: ["Organic Chemistry"], eligibility: "Master's qualification", minimumAcademicPercent: 55, requirement: "NET or URET", netExemptFromUret: false, synopsis: "None", documents: [], fee: 0, exemptCategories: [], selectionConfigurationId: "SC-DEMO-001" },
];
export const isOpenAdvertisement = (advertisement: AdmissionAdvertisement, date = today()) => advertisement.published && advertisement.status === "Published" && advertisement.starts <= date && advertisement.ends >= date;
export const activeAdvertisements = () => structuredClone(advertisements.filter((item) => isOpenAdvertisement(item)));
export const findAdvertisement = (id: string) => { const value = advertisements.find((item) => item.id === id); return value ? structuredClone(value) : undefined; };
