import { auth } from "./auth/auth";

type PermissionMap = Record<string, string[]>;

export async function checkPermissions(
  permissions: PermissionMap | PermissionMap[]
): Promise<{ success: boolean }> {
  const perms = Array.isArray(permissions) ? permissions : [permissions];

  for (const perm of perms) {
    const result = await auth.api.userHasPermission({ body: { permission: perm }});
    if (result.success) return { success: true };
  }

  return { success: false };
}
