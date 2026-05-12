<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">Vacation Management</div>
      <nav class="nav">
        <RouterLink to="/requester" class="nav-link">Requester</RouterLink>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-weight: 600;
  color: var(--text-h);
}

.nav {
  display: flex;
  gap: 10px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-h);
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--social-bg);
  border: 1px solid transparent;
}

.nav-link.router-link-active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.content {
  width: 1100px;
  max-width: 100%;
  margin: 0 auto;
  padding: 18px;
  box-sizing: border-box;
}
</style>
