import { computed } from 'vue'
import { authClient } from '@hrconnect/lib'

export function useAuth() {
  const session = computed(() => authClient.useSession())

  const isAuthenticated = computed(() => !!session.value.value.data?.user)

  const user = computed(() => session.value.value.data?.user)

  async function signOut() {
    await authClient.signOut()
  }

  // Role checking utilities (deprecated - role validation moved to router guard)
  function hasRole(requiredRoleId: number): boolean {
    console.warn('hasRole() is deprecated - use router guard for role validation')
    return false
  }

  function hasAnyRole(requiredRoleIds: number[]): boolean {
    console.warn('hasAnyRole() is deprecated - use router guard for role validation')
    return false
  }

  return {
    session,
    isAuthenticated,
    user,
    signOut,
    hasRole,
    hasAnyRole,
  }
}
