import { emptyProfile, type CandidateProfile } from "./candidateProfile";

/** Sample values for dummy-token login; contacts and documents remain unverified. */
export const demoCandidateProfile = (candidateId: string): CandidateProfile => ({
    ...emptyProfile(candidateId),
    fullName: "Ananya Das", mobile: "9000000001", email: "ananya.das@example.com", dateOfBirth: "1996-06-15",
    currentAddress: "Plot No. 42, Saheed Nagar, Bhubaneswar, Odisha", currentPin: "751001", sameAddress: true,
    permanentAddress: "Plot No. 42, Saheed Nagar, Bhubaneswar, Odisha", permanentPin: "751001",
    education: [
        { qualification: "Secondary School", institution: "Capital High School, Bhubaneswar", year: "2012", marks: "85.5" },
        { qualification: "Higher Secondary", institution: "BJB Higher Secondary School, Bhubaneswar", year: "2014", marks: "82" },
        { qualification: "BSc", institution: "Utkal University", year: "2017", marks: "78.5" },
        { qualification: "MSc", institution: "Utkal University", year: "2019", marks: "81" },
        { qualification: "MPhil", institution: "Ravenshaw University", year: "2021", marks: "84" },
    ],
});
