import z from "zod";

const ItemValidator = z.object({
  name: z.string(),
  serialNumber: z.string().nullable().optional(),
  description: z.string().optional().nullable(),
  buy: z.number(),
  sell: z.number(),
  productId: z.number(),
});
type ItemValidator = z.infer<typeof ItemValidator>;
export default ItemValidator;
