import type { RoleId, RoleName } from '@/validation/schemas'
import { z } from 'zod'

export const ROLE_ID = {
  ADMIN: 1,
  SUPERVISOR: 2,
  FINANCE: 3,
  HRD: 4,
  EMPLOYEE: 5,
} as const

export const ROLE_NAME = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  FINANCE: 'finance',
  HRD: 'hrd',
  EMPLOYEE: 'employee',
} as const

export const ROLE_ID_TO_NAME = {
  [ROLE_ID.ADMIN]: ROLE_NAME.ADMIN,
  [ROLE_ID.SUPERVISOR]: ROLE_NAME.SUPERVISOR,
  [ROLE_ID.FINANCE]: ROLE_NAME.FINANCE,
  [ROLE_ID.HRD]: ROLE_NAME.HRD,
  [ROLE_ID.EMPLOYEE]: ROLE_NAME.EMPLOYEE,
}

export const ROLE_NAME_TO_ID: Record<string, number> = Object.fromEntries(
  Object.entries(ROLE_ID_TO_NAME).map(([id, name]) => [name, Number(id)])
)

export const validRoleIdSchema = z.union(
  [z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)],
  { message: 'Invalid role ID' },
)

export const validRoleNameSchema = z.enum(
  [ROLE_NAME.ADMIN, ROLE_NAME.SUPERVISOR, ROLE_NAME.FINANCE, ROLE_NAME.HRD, ROLE_NAME.EMPLOYEE],
  { message: 'Invalid role name' },
)

export function getRoleName(roleId: RoleId | undefined): string {
  if (roleId === undefined) {
    throw new Error('roleId cannot be undefined')
  }
  const result = ROLE_ID_TO_NAME[roleId]
  if (!result) {
    throw new Error(`Invalid roleId: ${roleId}`)
  }
  return result
}

export function getRoleId(roleName: RoleName): number {
  const result = ROLE_NAME_TO_ID[roleName]
  if (!result) {
    throw new Error(`Invalid roleName: ${roleName}`)
  }
  return result
}

export function getRoleNameSafe(roleId: RoleId | undefined): string | null {
  if (roleId === undefined) return null
  const result = ROLE_ID_TO_NAME[roleId]
  return result ?? null
}

export function getRoleIdSafe(roleName: string): number | null {
  const result = ROLE_NAME_TO_ID[roleName]
  return result ?? null
}

export function isValidRoleId(roleId: number | unknown): boolean {
  return validRoleIdSchema.safeParse(roleId).success
}

export function isValidRoleName(roleName: string | unknown): boolean {
  return validRoleNameSchema.safeParse(roleName).success
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
