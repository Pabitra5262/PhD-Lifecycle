import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import { setActiveRole } from "@/features/shared/store/PayFixStore";
import { getCandidate, requestContactCode, saveCandidate, verifyContactCode } from "@/features/candidate-profile/model/candidateStore";
import { emptyProfile } from "@/features/candidate-profile/model/candidateProfile";
import { emptyApplication, saveApplication } from "@/features/phd-application/model/applicationStore";
import { scrutinyDocuments } from "../model/scrutinyRules";
import ApplicationScrutinyPage from "./ApplicationScrutinyPage";

beforeAll(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("min-width"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }));
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
const submitCandidate = (name: string) => {
    const pdf = () => new File(["%PDF-test"], "proof.pdf", { type: "application/pdf" });
    const account = crypto.randomUUID();
    const profile = { ...emptyProfile(getCandidate(account).profile.candidateId), fullName: name, mobile: "9876543210", email: "test@example.com", dateOfBirth: "2000-06-15", currentAddress: "Bhubaneswar", currentPin: "751001", sameAddress: true, education: [{ qualification: "MSc", institution: "Utkal University", year: "2024", marks: "80" }], qualificationType: "NET", examName: "NET", examYear: "2025", examScore: "180", qualificationCertificate: pdf(), identityDocument: pdf(), academicDocument: pdf(), declaration: true };
    for (const type of ["mobile", "email"] as const) { const code = requestContactCode(account, type, profile[type]); verifyContactCode(account, type, profile[type], code); }
    saveCandidate(account, profile, true);
    const result = saveApplication(account, { ...emptyApplication("PHD-DEMO-CS"), researchArea: "Data Science", synopsis: "Research interest", documents: { cv: pdf() }, eligibilityConfirmed: true, declaration: true }, true);
    if (!result.ok) throw new Error("Fixture submission failed");
    return result.application;
};
const renderPage = (role = "Department Authority / Course Coordinator") => { setActiveRole(role, true); return render(<Provider store={store}><MemoryRouter><ApplicationScrutinyPage /></MemoryRouter></Provider>); };

const choose = (control: HTMLElement, option: string) => {
    fireEvent.click(control);
    fireEvent.click(screen.getByRole("option", { name: option }));
};

const selectApplication = (reference: string) => {
    const advertisement = screen.getByRole("button", { name: /Advertisement Number/ });
    if (!advertisement.textContent?.includes("PHD/ADM/2027/001")) choose(advertisement, "PHD/ADM/2027/001");
    const previous = screen.queryByRole("button", { name: "Previous Application" });
    if (previous) while (!(previous as HTMLButtonElement).disabled) fireEvent.click(previous);
    for (let attempt = 0; attempt < 50; attempt++) {
        if ((screen.getByLabelText("Application Number") as HTMLInputElement).value === reference) return;
        const next = screen.getByRole("button", { name: "Next Application" });
        if ((next as HTMLButtonElement).disabled) break;
        fireEvent.click(next);
    }
    throw new Error("Application not available in scope");
};

describe("application scrutiny specification form", () => {
    it("shows the specified fields for both roles without a list layout", () => {
        for (const role of ["Department Authority / Course Coordinator", "Scrutiny / Selection / Research Committee"]) {
            const rendered = renderPage(role);
            expect(screen.getByRole("button", { name: /Advertisement Number/ })).toBeInTheDocument();
            expect(screen.getByLabelText("Application Number")).toHaveAttribute("readonly");
            expect(within(screen.getByRole("region", { name: "Candidate Details" })).getByLabelText("Full Name")).toHaveAttribute("readonly");
            expect(screen.getByRole("button", { name: /NET\/URET Verification/ })).toBeDisabled();
            expect(screen.getByLabelText("Document Verification")).toBeDisabled();
            expect(screen.getByLabelText("Scrutiny Remarks")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Decision/ })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Forward" })).toBeDisabled();
            expect(screen.getByRole("button", { name: "Return" })).toBeDisabled();
            expect(screen.queryByRole("table")).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Filter" })).not.toBeInTheDocument();
            rendered.unmount();
        }
    });
    it("populates read-only candidate details and keeps reviews separate while browsing applications", () => {
        const first = submitCandidate("First Candidate"); const second = submitCandidate("Second Candidate");
        renderPage(); selectApplication(first.reference);
        const details = within(screen.getByRole("region", { name: "Candidate Details" }));
        expect(details.getByLabelText("Full Name")).toHaveValue("First Candidate");
        expect(details.getByLabelText("Mobile Number")).toHaveAttribute("readonly");
        expect(details.getByRole("table")).toHaveTextContent("MSc");
        fireEvent.change(screen.getByLabelText("Scrutiny Remarks"), { target: { value: "First candidate clarification" } });
        choose(screen.getByRole("button", { name: /NET\/URET Verification/ }), "Verified");
        selectApplication(second.reference);
        expect(within(screen.getByRole("region", { name: "Candidate Details" })).getByLabelText("Full Name")).toHaveValue("Second Candidate");
        expect(screen.getByLabelText("Scrutiny Remarks")).toHaveValue("");
        expect(screen.getByRole("button", { name: /NET\/URET Verification/ })).toHaveTextContent("Search and select...");
        selectApplication(first.reference);
        expect(screen.getByLabelText("Scrutiny Remarks")).toHaveValue("First candidate clarification");
        expect(screen.getByRole("button", { name: /NET\/URET Verification/ })).toHaveTextContent("Verified");
    });
    it("records scrutiny only for the displayed application", async () => {
        const first = submitCandidate("Forward Candidate"); const second = submitCandidate("Untouched Candidate");
        renderPage(); selectApplication(first.reference);
        choose(screen.getByRole("button", { name: /NET\/URET Verification/ }), "Verified");
        choose(screen.getByRole("button", { name: /Decision/ }), "Eligible");
        for (const document of scrutinyDocuments(first)) choose(screen.getByLabelText(document.label + " verification"), document.file ? "Verified" : "Not Applicable");
        fireEvent.click(screen.getByRole("button", { name: "Forward" }));
        const dialog = await screen.findByRole("alertdialog");
        expect(within(dialog).getByText(new RegExp(first.reference))).toBeInTheDocument();
        fireEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));
        expect(screen.getByRole("button", { name: "Forward" })).toBeDisabled();
        selectApplication(second.reference);
        expect(screen.getByRole("button", { name: /Decision/ })).toHaveTextContent("Search and select...");
        expect(screen.getByRole("button", { name: /NET\/URET Verification/ })).toHaveTextContent("Search and select...");
    });
});
