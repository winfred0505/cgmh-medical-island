/**
 * 長庚醫療島 (CGMH Medical Island) 資料與即時通訊模擬模組
 * 負責提供即時急診狀態、看診進度、病床指標與數據變更推播
 */

export class CGMHDataManager {
  constructor() {
    this.data = null;
    this.islandsMap = new Map();
    this.listeners = new Set();
    this.timer = null;
  }

  async load() {
    try {
      const resp = await fetch('./data/cgmh_islands.json?v=' + Date.now());
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      this.data = await resp.json();

      this.data.islands.forEach(isl => {
        this.islandsMap.set(isl.id, isl);
      });

      this.startRealtimeSimulation();
      return this.data;
    } catch (err) {
      console.error('Failed to load cgmh_islands.json:', err);
      throw err;
    }
  }

  getIslands() {
    return this.data?.islands || [];
  }

  getIslandById(id) {
    return this.islandsMap.get(id);
  }

  getFlows() {
    return this.data?.flows || [];
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, payload) {
    this.listeners.forEach(cb => {
      try { cb(event, payload); } catch (e) { console.error(e); }
    });
  }

  // 模擬醫院即時動態微幅波動（每8秒隨機變動急診叫號與就診人數，增添微縮城市的生氣）
  startRealtimeSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.data) return;

      const randomIsland = this.data.islands[Math.floor(Math.random() * this.data.islands.length)];
      if (!randomIsland.realtime) return;

      // 微調急診人數 (±1 ~ ±2)
      if (typeof randomIsland.realtime.erWaitCount === 'number' && randomIsland.realtime.erWaitCount > 0) {
        const delta = Math.floor(Math.random() * 3) - 1;
        randomIsland.realtime.erWaitCount = Math.max(1, randomIsland.realtime.erWaitCount + delta);
      }

      // 今日就診人數微增
      if (typeof randomIsland.realtime.todayAppointments === 'number') {
        randomIsland.realtime.todayAppointments += Math.floor(Math.random() * 4) + 1;
      }

      // 智慧AI島算力推論微增
      if (randomIsland.id === 'smart_ai') {
        randomIsland.realtime.genomicAnalysesToday += 1;
      }

      this.notify('update', { islandId: randomIsland.id, realtime: randomIsland.realtime });
    }, 8000);
  }
}
