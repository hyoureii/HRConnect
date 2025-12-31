<template>
  <div class="login-page">
    <div class="login-container">
      <div class="user-icon-container">
        <i class="fa-solid fa-user"></i>
      </div>

      <h1>Welcome Back!</h1>
      <p>Please enter your email and password to access your account</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Email</label>
          <div class="input-field-wrapper">
            <i class="fa-solid fa-envelope input-icon"></i>
            <input v-model="formData.email" type="email" id="email" class="input-field" placeholder="Enter your email"
              @input="clearError" />
          </div>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-field-wrapper">
            <i class="fa-solid fa-lock input-icon"></i>
            <input v-model="formData.password" :type="isPasswordVisible ? 'text' : 'password'" id="password"
              class="input-field" placeholder="Enter your password" @input="clearError" />
            <i :class="[
              'fa-solid',
              isPasswordVisible ? 'fa-eye-slash' : 'fa-eye',
              'password-toggle-icon',
            ]" @click="togglePassword"></i>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '@hrconnect/lib'
import { loginSchema, type LoginInput } from '../validation/schemas'

const router = useRouter()

const formData = ref<LoginInput>({
  email: '',
  password: '',
})

const isPasswordVisible = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
const clearError = () => {
  errorMessage.value = ''
}

const handleLogin = async () => {
  const validation = loginSchema.safeParse(formData.value)

  if (!validation.success) {
    errorMessage.value = validation.error.message || 'Validation failed'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    const result = await authClient.signIn.email({
      email: validation.data.email,
      password: validation.data.password,
    })

    if (result.error) {
      errorMessage.value = result.error.message || 'Login failed. Please try again.'
      return
    }

    await router.push({ name: "Login", force: true })

  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: var(--light-grey-bg);
}

.login-container {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 39, 117, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.user-icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #eaf2ff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px auto;
}

.user-icon-container i {
  font-size: 36px;
  color: #0066ff;
}

h1 {
  color: #1a2b4e;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

p {
  color: #8a94a6;
  margin-bottom: 30px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #1a2b4e;
  font-weight: 500;
}

.input-field-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 14px 14px 14px 45px;
  border: 1px solid #dce4f2;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #0066ff;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.input-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #8a94a6;
}

.password-toggle-icon {
  position: absolute;
  top: 50%;
  right: 15px;
  transform: translateY(-50%);
  color: #8a94a6;
  cursor: pointer;
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  margin-top: 8px;
}

.login-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background-color: #0066ff;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #0052cc;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
