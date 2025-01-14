import { SalesChannel } from "./SalesChannel";
import { CustomField } from "../../common/CustomField";

/**
 * @public
 */
export type SalesChannelTranslation = {
  salesChannelId: string;
  name: string | null;
  salesChannel: SalesChannel | null;
  customFields: CustomField[];
};
