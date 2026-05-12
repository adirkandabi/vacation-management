<script setup lang="ts">
import { onMounted } from 'vue'
import { ensureValidatorUser, useValidatorUser } from '../composables/useValidatorUser'
import { useValidator } from '../composables/useValidator'

const { validatorUser, ready, loading: resolvingUser, error: resolveError } = useValidatorUser()

const {
  filterStatus,
  requests,
  loading,
  error,
  rejectId,
  rejectComment,
  filteredLabel,
  statusBadgeClass,
  refresh,
  approve,
  openReject,
  cancelReject,
  confirmReject,
} = useValidator()

onMounted(async () => {
  await ensureValidatorUser()
  if (ready.value) {
    await refresh()
  }
})
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1 class="title">Validator</h1>
        <p class="subtitle">Review and approve/reject vacation requests.</p>
        <p v-if="validatorUser" class="me">
          Signed in as <strong>{{ validatorUser.name }}</strong> ({{ validatorUser.role }})
        </p>
      </div>

      <div class="controls">
        <div class="control">
          <label class="label" for="status">Status</label>
          <select id="status" class="input" v-model="filterStatus" @change="refresh" :disabled="loading || resolvingUser">
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div class="control">
          <label class="label">&nbsp;</label>
          <button class="btn" type="button" @click="refresh" :disabled="loading || resolvingUser">
            Refresh
          </button>
        </div>
      </div>
    </header>

    <div v-if="resolveError" class="alert">
      {{ resolveError }}
    </div>
    <div v-else-if="resolvingUser" class="empty">
      Resolving validator user...
    </div>

    <div v-if="error" class="alert">
      {{ error }}
    </div>

    <section class="card">
      <div class="card-head">
        <h2 class="card-title">Requests ({{ filteredLabel }})</h2>
      </div>

      <div v-if="!ready" class="empty">
        Validator user not ready.
      </div>
      <div v-else-if="loading" class="empty">
        Loading...
      </div>
      <div v-else-if="requests.length === 0" class="empty">
        No requests found.
      </div>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Employee</th>
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
                <div class="employee">{{ r.user?.name || `User #${r.userId}` }}</div>
                <div class="meta">UserId: {{ r.userId }}</div>
              </td>
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
                <div v-if="r.status === 'Pending' && rejectId !== r.id" class="action-row">
                  <button class="btn btn-primary" type="button" :disabled="loading" @click="approve(r)">
                    Approve
                  </button>
                  <button class="btn btn-danger" type="button" :disabled="loading" @click="openReject(r)">
                    Reject
                  </button>
                </div>

                <div v-else-if="rejectId === r.id" class="reject-box">
                  <label class="label" :for="`reject-${r.id}`">Rejection comment *</label>
                  <textarea
                    class="textarea"
                    rows="2"
                    :id="`reject-${r.id}`"
                    v-model="rejectComment"
                    placeholder="Required"
                  />
                  <div class="action-row">
                    <button class="btn btn-danger" type="button" :disabled="loading" @click="confirmReject">
                      Confirm reject
                    </button>
                    <button class="btn" type="button" :disabled="loading" @click="cancelReject">
                      Cancel
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
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
.me {
  margin: 10px 0 0;
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.control {
  min-width: 160px;
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

.btn-danger {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.08);
  color: var(--text-h);
}

.alert {
  border: 1px solid rgba(220, 38, 38, 0.4);
  background: rgba(220, 38, 38, 0.08);
  color: var(--text-h);
  padding: 10px 12px;
  border-radius: 12px;
  margin: 12px 0 16px;
}

.card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: var(--bg);
  box-shadow: var(--shadow);
}

.card-title {
  margin: 0;
  font-size: 18px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
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
  min-width: 980px;
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

.employee {
  font-weight: 600;
  color: var(--text-h);
}

.dates {
  color: var(--text-h);
}

.meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text);
}

.muted {
  color: var(--text);
}

.actions-col {
  width: 1%;
}

.row-actions {
  text-align: right;
}

.action-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.reject-box {
  min-width: 260px;
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
</style>

