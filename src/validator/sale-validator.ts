import z, { custom } from "zod";
import SaleItemValidator from "./sale-item-validator";

const SaleValidator = z.object({
  saleItems: z.array(SaleItemValidator).min(1),
  type: z.string(),
  status: z.string(),
  invoiceId: z.string().optional().nullable(),
  customerId: z.number().optional().nullable(),
  note: z.string().optional().nullable(),
});
type SaleValidator = z.infer<typeof SaleValidator>;
export default SaleValidator;
