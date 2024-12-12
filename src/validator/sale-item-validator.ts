import z from "zod";

const SaleItemValidator = z.object({
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
  note: z.string().optional().nullable(),
  startGuarantee: z.date().optional().nullable(),
  endGuarantee: z.date().optional().nullable(),
  itemId: z.number(),
  saleId: z.number(),
});
type SaleItemValidator = z.infer<typeof SaleItemValidator>;
export default SaleItemValidator;
