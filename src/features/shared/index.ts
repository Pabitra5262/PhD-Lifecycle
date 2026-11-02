// Module-wide types, store, rules and components for the Pay Fixation & Pay Protection features.
export * from "./types/payfix.types";
export * from "./roles";
export * from "./workflow";
export { INSTITUTIONS, CADRES, DESIGNATIONS, EVENTS, PROPOSAL_TYPES, CURRENT_USER, historyFromProposal } from "./data/payfixData";
export { usePayFix, useRole, setActiveRole, type RoleValue } from "./store/PayFixStore";
export { useCurrentUser } from "./hooks/useCurrentUser";
export { ProposalStatusBadge } from "./components/ProposalStatusBadge";
export { PayComparison } from "./components/PayComparison";
export { ProposalSummary, Fields, DocumentList } from "./components/ProposalSummary";
export { WorkflowTrack } from "./components/WorkflowTrack";
export { MovementHistory } from "./components/MovementHistory";
export { DemoRoleSwitcher } from "./components/DemoRoleSwitcher";
export { TabsCard } from "./components/TabsCard";
export { PanelCard } from "./components/PanelCard";
