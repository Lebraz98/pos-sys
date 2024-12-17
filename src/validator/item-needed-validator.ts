import z from "zod";

const ItemNeededValidator = z.object({
  status: z.string(),
  itemId: z.number(),
  quantity: z.number(),
  note: z.string().optional().nullable(),
});
type ItemNeededValidator = z.infer<typeof ItemNeededValidator>;
export default ItemNeededValidator;
