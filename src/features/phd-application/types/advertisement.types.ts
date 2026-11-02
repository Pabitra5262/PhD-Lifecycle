export interface AdmissionAdvertisement {
    id: string; number: string; title: string; university: string; department: string; academicSession: string;
    published: boolean; status: "Published" | "Closed" | "Draft"; starts: string; ends: string;
    researchAreas: string[]; eligibility: string; minimumAcademicPercent: number;
    requirement: "NET" | "URET" | "NET or URET" | "None"; netExemptFromUret: boolean;
    synopsis: "None" | "Text" | "File" | "Text or File";
    documents: { id: string; label: string; required: boolean }[];
    fee: number; exemptCategories: string[]; selectionConfigurationId: string;
}
