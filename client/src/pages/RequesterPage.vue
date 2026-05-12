<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDemoUser } from '../composables/useDemoUser'
import { useRequester } from '../composables/useRequester'

const { userId, hasUser } = useDemoUser()

const {
  me,
  requests,
  loading,
  error,
  startDate,
  endDate,
  reason,
  canSubmit,
  refresh,
  submit,
  removeRequest,
  statusBadgeClass,
} = useRequester()

const userIdText = ref(userId.value ? String(userId.value) : '')

function setUserAndLoad() {
  const raw = userIdText.value.trim()
  if (raw === '') {
    userId.value = null
    void refresh(null)
    return
  }
  const n = Number.parseInt(raw, 10)
  userId.value = Number.isFinite(n) && n > 0 ? n : null
  void refresh(userId.value)
}

async function removeAndRefresh(r: any) {
  await removeRequest(r)
  await refresh(userId.value)
}

onMounted(() => refresh(hasUser.value ? userId.value : null))

watch(userId, (val) => {
  userIdText.value = val ? String(val) : ''
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="title">Requester</h1>
        <p class="subtitle">
          Submit a vacation request and track its status.
        </p>
      </div>

      <div class="user-box">
        <label class="label" for="userId">Demo user id</label>
        <div class="row">
          <input
            id="userId"
            class="input"
            inputmode="numeric"
            placeholder="e.g. 1"
            v-model="userIdText"
          />
          <button class="btn" type="button" @click="setUserAndLoad" :disabled="loading">
            Set & Load
          </button>
        </div>
        <p v-if="me" class="me">
          Acting as <strong>{{ me.name }}</strong> ({{ me.role }})
        </p>
        <p v-else class="hint">
          Use a seeded requester id (created on server start).
        </p>
      </div>
    </header>

    <div v-if="error" class="alert">
      {{ error }}
    </div>

    <div class="grid">
      <section class="card">
        <h2 class="card-title">New request</h2>
        <form class="form" @submit.prevent="submit">
          <div class="form-grid">
            <div>
              <label class="label" for="start">Start date *</label>
              <input id="start" class="input" type="date" v-model="startDate" />
            </div>
            <div>
              <label class="label" for="end">End date *</label>
              <input id="end" class="input" type="date" v-model="endDate" />
            </div>
          </div>

          <div>
            <label class="label" for="reason">Reason (optional)</label>
            <textarea
              id="reason"
              class="textarea"
              rows="3"
              v-model="reason"
              placeholder="Anything you want to add..."
            />
          </div>

          <div class="actions">
            <button class="btn btn-primary" type="submit" :disabled="!canSubmit || loading">
              Submit request
            </button>
          </div>
        </form>
      </section>

      <section class="card">
        <div class="card-head">
          <h2 class="card-title">My requests</h2>
          <button class="btn" type="button" @click="refresh(userId)" :disabled="loading || !hasUser">
            Refresh
          </button>
        </div>

        <div v-if="!hasUser" class="empty">
          Set a demo user id to load your requests.
        </div>
        <div v-else-if="loading" class="empty">
          Loading...
        </div>
        <div v-else-if="requests.length === 0" class="empty">
          No requests yet.
        </div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Dates</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Comments</th>
                <th class="actions-col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in requests" :key="r.id">
                <td>
                  <div class="dates">{{ r.startDate }} → {{ r.endDate }}</div>
                  <div class="meta">#{{ r.id }} • {{ new Date(r.createdAt).toLocaleString() }}</div>
                </td>
                <td>
                  <span :class="statusBadgeClass(r.status)">{{ r.status }}</span>
                </td>
                <td class="muted">{{ r.reason || '—' }}</td>
                <td class="muted">{{ r.comments || '—' }}</td>
                <td class="row-actions">
                  <button
                    v-if="r.status === 'Pending'"
                    class="btn btn-danger"
                    type="button"
                    :disabled="loading"
                    @click="removeAndRefresh(r)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.page-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.title {
  margin: 0;
  font-size: 28px;
}
.subtitle {
  margin: 6px 0 0;
  color: var(--text);
}

.user-box {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  min-width: min(380px, 100%);
  box-sizing: border-box;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.label {
  display: block;
  font-size: 14px;
  margin: 0 0 6px;
  color: var(--text);
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  outline: none;
}

.input:focus,
.textarea:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.btn {
  padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.me,
.hint {
  margin: 10px 0 0;
  font-size: 14px;
}
.hint {
  color: var(--text);
}

.alert {
  border: 1px solid rgba(220, 38, 38, 0.4);
  background: rgba(220, 38, 38, 0.08);
  color: var(--text-h);
  padding: 10px 12px;
  border-radius: 12px;
  margin: 12px 0 16px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: 16px;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: var(--bg);
  box-shadow: var(--shadow);
}

.card-title {
  margin: 0 0 12px;
  font-size: 18px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 520px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.empty {
  padding: 14px 0;
  color: var(--text);
}

.table-wrap {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 8px;
  border-top: 1px solid var(--border);
  vertical-align: top;
}

.table thead th {
  border-top: none;
  font-size: 13px;
  color: var(--text);
  font-weight: 600;
}

.meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text);
}

.muted {
  color: var(--text);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  border: 1px solid var(--border);
}

.badge-pending {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.35);
}
.badge-approved {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
}
.badge-rejected {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
}

.actions-col {
  width: 1%;
}

.row-actions {
  text-align: right;
}

.btn-danger {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
  color: var(--text-h);
}
</style>

