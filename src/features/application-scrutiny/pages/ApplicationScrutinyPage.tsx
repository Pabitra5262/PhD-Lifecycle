import PageHeader from "@/shared/components/layout/PageHeader";
import { useAppSelector } from "@/app/hooks";
import { useRole } from "@/features/shared/store/PayFixStore";
import { resolveScrutinyActor } from "../service/scrutinyActorService";
import { useApplicationScrutiny } from "../hooks/useApplicationScrutiny";
import { ApplicationScrutinyCard } from "../components/ApplicationScrutinyCard";
import { ApplicationScrutinyDialogs } from "../components/ApplicationScrutinyDialogs";
import type { ScrutinyActor } from "../types";

const ScrutinyPage = ({ actor, demo, combinedCommittee }: { actor: ScrutinyActor; demo: boolean; combinedCommittee: boolean }) => {
    const controller = useApplicationScrutiny(actor, demo, combinedCommittee);
    return <>
        <PageHeader title="Application Scrutiny" />
        <ApplicationScrutinyCard controller={controller} />
        <ApplicationScrutinyDialogs controller={controller} />
    </>;
};
const ApplicationScrutinyPage = () => {
    const { workflowRole: role, role: selectedRole } = useRole();
    const user: unknown = useAppSelector((state) => state.auth.user);
    const token = useAppSelector((state) => state.auth.token);
    const actor = resolveScrutinyActor(role, user);
    if (!actor) return null;
    return <ScrutinyPage key={actor.userId + ":" + actor.role + ":" + actor.university + ":" + actor.departments.join(",")} actor={actor} combinedCommittee={selectedRole === "Department Authority / Committees"} demo={token === "dummy-token" && !user} />;
};
export default ApplicationScrutinyPage;
