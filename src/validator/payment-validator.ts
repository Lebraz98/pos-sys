import z from "zod";

const PaymentValidator = z.object({
  note: z.string().nullable().optional(),
  amount: z.number(),
  invoiceId: z.number(),
  date: z.date(),
});
type PaymentValidator = z.infer<typeof PaymentValidator>;
export default PaymentValidator;
