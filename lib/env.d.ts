import z from "zod";
declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodString;
    DB_URL: z.ZodString;
    BETTER_AUTH_SECRET: z.ZodString;
    BETTER_AUTH_URL: z.ZodString;
}, z.core.$strip>;
export type EnvSchema = z.infer<typeof EnvSchema>;
declare const _default: {
    NODE_ENV: string;
    DB_URL: string;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
};
export default _default;
//# sourceMappingURL=env.d.ts.map