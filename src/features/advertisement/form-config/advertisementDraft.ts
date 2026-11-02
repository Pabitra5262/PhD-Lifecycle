import type { AdvertisementForm } from "./advertisementConfig";
// In-memory draft for the wireframe, including uploaded File objects. No server upload occurs.
let draft: AdvertisementForm | undefined;
export const readAdvertisementDraft = () => draft;
export const saveAdvertisementDraft = (values: AdvertisementForm) => { draft = { ...values, permittedExemptions: [...values.permittedExemptions] }; };
