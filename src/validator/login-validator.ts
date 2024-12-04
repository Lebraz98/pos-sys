import z from "zod";

const LoginValidator = z.object({
  username: z.string(),
  password: z.string(),
});

type LoginValidator = z.infer<typeof LoginValidator>;
export default LoginValidator;
