import z from "zod";

const ProductValidator = z.object({
  name: z.string(),
  barcode: z.string().nullable().optional(),
  description: z.string().optional().nullable(),
});
type ProductValidator = z.infer<typeof ProductValidator>;
export default ProductValidator;
