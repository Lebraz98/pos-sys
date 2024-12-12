import z from "zod";

const CustomerValidator = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
});
type CustomerValidator = z.infer<typeof CustomerValidator>;
export default CustomerValidator;
