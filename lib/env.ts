import z from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.string(),
    DB_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string()
})

export type EnvSchema = z.infer<typeof EnvSchema>;

export default EnvSchema.parse(process.env);
