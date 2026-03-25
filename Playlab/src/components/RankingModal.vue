<template>
  <div class="modal-overlay" @click.self="emitClose">
    <div class="modal-card" role="dialog" aria-modal="true">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="emitClose">✕</button>
      </header>

      <div class="modal-body">
        <table class="ranking-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Nombre</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, index) in entries" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ entry.name }}</td>
              <td>{{ formatScore(entry.score) }}</td>
            </tr>
            <tr v-if="!entries || entries.length === 0">
              <td colspan="3" class="empty">Sin puntajes aún</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RankingModal',
  props: {
    title: { type: String, default: 'Ranking' },
    entries: { type: Array, default: () => [] }
  },
  methods: {
    emitClose() {
      this.$emit('close');
    },
    formatScore(s) {
      if (typeof s === 'number') return s.toLocaleString();
      return s;
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 2rem;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}

.modal-body { padding: 1rem 1.25rem 1.5rem 1.25rem; }

.ranking-table { width: 100%; border-collapse: collapse; }
.ranking-table thead th { text-align: left; font-size: 0.85rem; color: #444; padding-bottom: 0.5rem; }
.ranking-table tbody td { padding: 0.55rem 0; border-bottom: 1px solid #f3f3f3; }
.ranking-table tbody tr td:first-child { width: 40px; color: #666; }
.ranking-table tbody tr td:nth-child(3) { text-align: right; font-weight: 700; }
.ranking-table .empty { text-align: center; color: #888; padding: 1rem 0; }

</style>
