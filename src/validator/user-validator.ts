import z from "zod";

const UserValidator = z.object({
  username: z.string(),
  password: z.string(),
  role: z.string(),
  active: z.boolean(),
  name: z.string(),
});

type UserValidator = z.infer<typeof UserValidator>;
export default UserValidator;
