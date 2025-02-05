import z from "zod";

const InvoiceValidator = z.object({
  note: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  amount: z.number(),
  type: z.string(),
  customerId: z.number(),
  date: z.date(),
  data: z.string().optional().nullable().default("[]"),
});
type InvoiceValidator = z.infer<typeof InvoiceValidator>;
export default InvoiceValidator;
