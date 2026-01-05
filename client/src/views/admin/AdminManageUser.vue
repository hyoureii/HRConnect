<template>
  <Layout>
    <section id="manage-user" class="content-section">
      <div class="widget full-width-widget">
        <div class="widget-header">
          <h3>Manajemen Pengguna</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Cari Pengguna"
              class="search-input"
            />
            <button class="btn-search"><i class="fa-solid fa-magnifying-glass"></i></button>
          </div>
        </div>
        <table class="activity-log-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Role</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="index">
              <td>{{ user.name }}</td>
              <td>
                <span :class="['role-tag', user.roleClass]">{{ user.roleLabel }}</span>
              </td>
              <td>
                <span :class="['status-tag', user.statusClass]">{{ user.status }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn edit-btn" @click="editUser(user)" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="action-btn delete-btn" @click="deleteUser(user)" title="Hapus">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="widget full-width-widget" style="margin-top: 30px">
        <h3>Tambah Pengguna Baru</h3>
        <form class="card-form" @submit.prevent="addUser" style="padding: 0; box-shadow: none">
          <div class="form-group-row">
            <div class="form-group">
              <label for="user-name">Nama Pengguna</label>
              <input type="text" id="user-name" v-model="newUser.name" required />
            </div>
            <div class="form-group">
              <label for="user-password">Password</label>
              <input type="password" id="user-password" v-model="newUser.password" required />
            </div>
          </div>
          <div class="form-group">
            <label for="user-role">Role</label>
            <select id="user-role" v-model="newUser.role" required>
              <option value="" disabled selected>Pilih Role</option>
              <option value="admin">Admin</option>
              <option value="hrd">HRD</option>
              <option value="supervisor">Supervisor</option>
              <option value="finance">Finance</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <button type="submit" class="submit-button">Tambah Pengguna</button>
        </form>
      </div>

      <div id="edit-user-modal" class="modal-overlay" :class="{ show: showEditModal }">
        <div class="modal-content" style="text-align: left; max-width: 700px">
          <h2 style="text-align: center; margin-bottom: 20px">Edit Pengguna</h2>
          <form @submit.prevent="promptSaveChanges">
            <div class="form-group" style="margin-bottom: 15px">
              <label style="display: block; margin-bottom: 5px; font-weight: 500"
                >Nama Pengguna</label
              >
              <input
                type="text"
                v-model="editingUser.name"
                required
                style="width: 100%; padding: 10px; border: 1px solid #dce4f2; border-radius: 8px"
              />
            </div>
            <div class="form-group" style="margin-bottom: 15px">
              <label style="display: block; margin-bottom: 5px; font-weight: 500">Password</label>
              <input
                type="password"
                v-model="editingUser.password"
                placeholder="Masukkan password baru (opsional)"
                style="width: 100%; padding: 10px; border: 1px solid #dce4f2; border-radius: 8px"
              />
            </div>
            <div class="form-group" style="margin-bottom: 25px">
              <label style="display: block; margin-bottom: 5px; font-weight: 500">Role</label>
              <select
                v-model="editingUser.role"
                required
                style="width: 100%; padding: 10px; border: 1px solid #dce4f2; border-radius: 8px"
              >
                <option value="admin">Admin</option>
                <option value="hrd">HRD</option>
                <option value="supervisor">Supervisor</option>
                <option value="finance">Finance</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div
              class="modal-actions"
              style="justify-content: flex-end; gap: 10px; display: flex; margin-top: 25px"
            >
              <button type="button" class="btn-confirm-no" @click="closeEditModal">Batal</button>
              <button type="submit" class="btn-confirm-yes">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <div id="confirm-save-modal" class="modal-overlay" :class="{ show: showConfirmSaveModal }">
        <div class="modal-content">
          <div class="modal-icon">
            <i class="fa-solid fa-circle-question" style="color: var(--warning-orange)"></i>
          </div>
          <h2>Konfirmasi Simpan</h2>
          <p>Apakah Anda yakin menyimpan perubahan tersebut?</p>
          <div class="modal-actions">
            <button class="btn-confirm-yes" @click="confirmSave">Ya</button>
            <button class="btn-confirm-no" @click="cancelSave">Batal</button>
          </div>
        </div>
      </div>

      <div id="delete-confirmation-modal" class="modal-overlay" :class="{ show: showDeleteModal }">
        <div class="modal-content">
          <div class="modal-icon">
            <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger-red)"></i>
          </div>
          <h2>Konfirmasi Hapus</h2>
          <p>Apakah Anda yakin ingin menghapus pengguna ini?</p>
          <div class="modal-actions">
            <button
              class="btn-confirm-yes"
              style="background-color: var(--danger-red)"
              @click="confirmDelete"
            >
              Ya, Hapus
            </button>
            <button class="btn-confirm-no" @click="showDeleteModal = false">Batal</button>
          </div>
        </div>
      </div>

      <div id="success-modal" class="modal-overlay" :class="{ show: showSuccessModal }">
        <div class="modal-content">
          <div class="modal-icon">
            <i class="fa-solid fa-circle-check" style="color: var(--success-green)"></i>
          </div>
          <h2>Berhasil!</h2>
          <p>{{ successMessage }}</p>
          <button class="submit-button" @click="closeSuccessModal" style="margin-top: 10px">
            OK
          </button>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Layout from '@/Layout.vue'

const searchQuery = ref('')

const users = ref([
  { name: 'Fizryan', roleLabel: 'HRD', roleClass: 'hrd', status: 'Aktif', statusClass: 'active' },
  {
    name: 'Haidar',
    roleLabel: 'Supervisor',
    roleClass: 'supervisor',
    status: 'Aktif',
    statusClass: 'active',
  },
  {
    name: 'Naufal',
    roleLabel: 'Finance',
    roleClass: 'finance',
    status: 'Aktif',
    statusClass: 'active',
  },
  {
    name: 'Fathir',
    roleLabel: 'Employee',
    roleClass: 'employee',
    status: 'Aktif',
    statusClass: 'active',
  },
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return users.value
  }
  const query = searchQuery.value.toLowerCase()
  return users.value.filter((user) => user.name.toLowerCase().includes(query))
})

const newUser = ref({
  name: '',
  password: '',
  role: '',
})

const showEditModal = ref(false)
const showConfirmSaveModal = ref(false)
const showDeleteModal = ref(false)
const showSuccessModal = ref(false)
const successMessage = ref('')
const targetIndex = ref(-1)
const editingUser = reactive({
  name: '',
  password: '',
  role: '',
})

const addUser = () => {
  const roleMap = {
    admin: { label: 'Admin', class: 'admin' },
    hrd: { label: 'HRD', class: 'hrd' },
    supervisor: { label: 'Supervisor', class: 'supervisor' },
    finance: { label: 'Finance', class: 'finance' },
    employee: { label: 'Employee', class: 'employee' },
  }

  const roleInfo = roleMap[newUser.value.role]

  users.value.push({
    name: newUser.value.name,
    roleLabel: roleInfo.label,
    roleClass: roleInfo.class,
    status: 'Aktif',
    statusClass: 'active',
  })

  newUser.value.name = ''
  newUser.value.password = ''
  newUser.value.role = ''
}

const deleteUser = (user) => {
  const index = users.value.indexOf(user)
  if (index !== -1) {
    targetIndex.value = index
    showDeleteModal.value = true
  }
}

const confirmDelete = () => {
  if (targetIndex.value !== -1) {
    users.value.splice(targetIndex.value, 1)
    showDeleteModal.value = false
    successMessage.value = 'Pengguna berhasil dihapus'
    showSuccessModal.value = true
  }
}

const editUser = (user) => {
  targetIndex.value = users.value.indexOf(user)
  editingUser.name = user.name
  editingUser.password = ''
  editingUser.role = user.roleClass
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const promptSaveChanges = () => {
  showEditModal.value = false
  showConfirmSaveModal.value = true
}

const cancelSave = () => {
  showConfirmSaveModal.value = false
  showEditModal.value = true
}

const confirmSave = () => {
  if (targetIndex.value !== -1) {
    const roleMap = {
      admin: { label: 'Admin', class: 'admin' },
      hrd: { label: 'HRD', class: 'hrd' },
      supervisor: { label: 'Supervisor', class: 'supervisor' },
      finance: { label: 'Finance', class: 'finance' },
      employee: { label: 'Employee', class: 'employee' },
    }

    const roleInfo = roleMap[editingUser.role]

    users.value[targetIndex.value].name = editingUser.name
    users.value[targetIndex.value].roleLabel = roleInfo.label
    users.value[targetIndex.value].roleClass = roleInfo.class

    showConfirmSaveModal.value = false
    successMessage.value = 'Perubahan berhasil disimpan'
    showSuccessModal.value = true
    targetIndex.value = -1
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}
</script>

<style scoped>
.content-section {
  display: block;
}

.activity-log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

.activity-log-table th,
.activity-log-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.activity-log-table thead th {
  background-color: var(--light-grey-bg);
  font-weight: 600;
  color: var(--dark-text);
}

.activity-log-table tbody tr:last-child td {
  border-bottom: none;
}

.role-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.role-tag.employee {
  background-color: #eaf2ff;
  color: #0066ff;
}
.role-tag.supervisor {
  background-color: #d4efdf;
  color: #155724;
}
.role-tag.finance {
  background-color: #f8d7da;
  color: #721c24;
}
.role-tag.admin {
  background-color: #fdebd0;
  color: #856404;
}
.role-tag.hrd {
  background-color: #d6d8db;
  color: #383d41;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.active {
  background-color: #d4efdf;
  color: #155724;
}
.status-tag.non-active {
  background-color: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.edit-btn {
  background-color: var(--warning-orange);
}

.delete-btn {
  background-color: var(--danger-red);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background-color: var(--white);
  padding: 30px 40px;
  border-radius: 15px;
  text-align: center;
  width: 90%;
  max-width: 380px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-overlay.show .modal-content {
  transform: scale(1);
}

.modal-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-confirm-yes {
  background-color: var(--primary-blue);
  color: white;
}
.btn-confirm-yes:hover {
  background-color: #0052cc;
}

.btn-confirm-no {
  background-color: #e0e0e0;
  color: #333;
}
.btn-confirm-no:hover {
  background-color: #d0d0d0;
}
</style>
