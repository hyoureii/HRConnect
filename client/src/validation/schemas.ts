import { z } from 'zod'
import { ROLE_ID, ROLE_NAME } from '@/utils/roles'

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .trim(),
})

export type LoginInput = z.infer<typeof loginSchema>

export const userSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .trim(),
  role: z.union(
    [
      z.literal(ROLE_ID.ADMIN),
      z.literal(ROLE_ID.SUPERVISOR),
      z.literal(ROLE_ID.FINANCE),
      z.literal(ROLE_ID.HRD),
      z.literal(ROLE_ID.EMPLOYEE),
    ],
    { message: 'Invalid role' },
  ),
})

export type UserInput = z.infer<typeof userSchema>

export const roleIdSchema = z
  .union(
    [
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ],
    { message: 'Invalid role ID' },
  )
  .describe('Valid role ID (1-5)')

export type RoleId = z.infer<typeof roleIdSchema>

export const roleNameSchema = z.enum(
  [ROLE_NAME.ADMIN, ROLE_NAME.SUPERVISOR, ROLE_NAME.FINANCE, ROLE_NAME.HRD, ROLE_NAME.EMPLOYEE],
  { message: 'Invalid role name' },
)

export type RoleName = z.infer<typeof roleNameSchema>

export const userSessionSchema = z.object({
  role_id: roleIdSchema,
})

export type UserSession = z.infer<typeof userSessionSchema>

export const userRoleResponseSchema = z.object({
  roleId: roleIdSchema,
  roleName: roleNameSchema
})

export type UserRoleResponse = z.infer<typeof userRoleResponseSchema>
