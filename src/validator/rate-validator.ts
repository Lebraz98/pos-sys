import z from "zod";

const RateValidator = z.object({
  value: z.number(),
});
type RateValidator = z.infer<typeof RateValidator>;
export default RateValidator;
