import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authClient, type Session } from '../../lib/auth-client'

export const useAuth = defineStore('auth', () => {
  const session = ref<Session | null>(null);
  const isAuthenticated = computed(() => !!session.value)

  async function restoreSession() {
    const s = await authClient.getSession();
    session.value = s.data;
  }

  async function login(email: string, password: string) {
    await authClient.signIn.email({
      email: email,
      password: password
    });
    await restoreSession();
  }

  function logout() {
    authClient.signOut();
    session.value = null;
  }

  return { session, isAuthenticated, login, logout, restoreSession  }
})
