/**
 * 長庚醫療島 (CGMH Medical Island) 互動 UI 與使用者體驗控制模組
 * 包含：平滑相機導航、底層浮動 Dock、院區即時醫療詳情抽屜、即時急診雷達儀表板與音效
 */

import * as THREE from 'three';
import { axialToWorld, HEIGHT } from './cgmh_constants.js';

export class CGMHUIManager {
  constructor(app, dataManager) {
    this.app = app;
    this.dataManager = dataManager;
    this.selectedIslandId = null;
    this.hoveredIslandMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.audioCtx = null;
    this.initElements();
    this.bindEvents();
    this.renderDock();
    this.listenDataUpdates();
  }

  initElements() {
    this.dom = {
      dock: document.getElementById('island-dock'),
      card: document.getElementById('hospital-card'),
      cardClose: document.getElementById('card-close'),
      cardTitle: document.getElementById('card-title'),
      cardCategory: document.getElementById('card-category'),
      cardTagline: document.getElementById('card-tagline'),
      cardStats: document.getElementById('card-stats'),
      cardPillars: document.getElementById('card-pillars'),
      cardLinks: document.getElementById('card-links'),
      btnOverview: document.getElementById('btn-overview'),
      btnOrbit: document.getElementById('btn-orbit'),
      btnFlows: document.getElementById('btn-flows'),
      btnErRadar: document.getElementById('btn-er-radar'),
      erModal: document.getElementById('er-modal'),
      erModalClose: document.getElementById('er-modal-close'),
      erList: document.getElementById('er-list'),
      timeButtons: document.querySelectorAll('.time-tab'),
      ticker: document.getElementById('ticker-text')
    };
  }

  bindEvents() {
    // 1. 晝夜時段切換
    this.dom.timeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.dom.timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.time;
        this.app.environment.applyTimeMode(mode);
        this.playTone(440, 'sine', 0.1);
      });
    });

    // 2. 工具列操作
    if (this.dom.btnOverview) {
      this.dom.btnOverview.addEventListener('click', () => {
        this.resetCamera();
        this.closeCard();
        this.playTone(520, 'sine', 0.12);
      });
    }

    if (this.dom.btnOrbit) {
      this.dom.btnOrbit.addEventListener('click', () => {
        const active = this.dom.btnOrbit.classList.toggle('active');
        this.app.autoRotate = active;
        this.playTone(active ? 600 : 380, 'sine', 0.1);
      });
    }

    if (this.dom.btnFlows) {
      this.dom.btnFlows.addEventListener('click', () => {
        const active = this.dom.btnFlows.classList.toggle('active');
        this.app.worldBuilder.setFlowsVisible(active);
        this.playTone(480, 'sine', 0.1);
      });
    }

    if (this.dom.btnErRadar) {
      this.dom.btnErRadar.addEventListener('click', () => {
        this.openErRadarModal();
        this.playTone(580, 'triangle', 0.15);
      });
    }

    if (this.dom.erModalClose) {
      this.dom.erModalClose.addEventListener('click', () => {
        this.closeErRadarModal();
      });
    }

    if (this.dom.erModal) {
      this.dom.erModal.addEventListener('click', (e) => {
        if (e.target === this.dom.erModal) {
          this.closeErRadarModal();
        }
      });
    }

    // 按下 ESC 鍵關閉彈窗與卡片
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeErRadarModal();
        this.closeCard();
      }
    });

    // 3. 卡片抽屜關閉
    if (this.dom.cardClose) {
      this.dom.cardClose.addEventListener('click', () => {
        this.closeCard();
      });
    }

    // 4. 點擊 3D 場景畫布射線檢測
    window.addEventListener('click', (e) => {
      // 避免點擊在 UI 元件上觸發
      if (e.target.closest('.ui-layer') || e.target.closest('.card-panel') || e.target.closest('.modal-overlay')) {
        return;
      }

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.app.camera);
      const intersects = this.raycaster.intersectObjects(this.app.scene.children, true);

      let hitIslandId = null;
      for (const hit of intersects) {
        if (hit.object.userData?.isIslandHit) {
          hitIslandId = hit.object.userData.islandId;
          break;
        }
      }

      if (hitIslandId) {
        this.selectIsland(hitIslandId);
      }
    });

    // 5. 滑鼠懸停指針效果
    window.addEventListener('mousemove', (e) => {
      if (e.target.closest('.ui-layer') || e.target.closest('.card-panel')) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.app.camera);
      const intersects = this.raycaster.intersectObjects(this.app.scene.children, true);

      let hovered = null;
      for (const hit of intersects) {
        if (hit.object.userData?.isIslandHit) {
          hovered = hit.object.userData.islandId;
          break;
        }
      }

      document.body.style.cursor = hovered ? 'pointer' : 'default';
    });
  }

  // 底部 Dock 導覽列
  renderDock() {
    if (!this.dom.dock) return;
    this.dom.dock.innerHTML = '';

    const islands = this.dataManager.getIslands();
    islands.forEach(isl => {
      const item = document.createElement('button');
      item.className = 'dock-item';
      item.dataset.islandId = isl.id;
      item.title = isl.name;
      item.innerHTML = `
        <span class="dock-icon">${isl.icon || '🏥'}</span>
        <span class="dock-name">${isl.name.replace('長庚', '').replace('島', '')}</span>
      `;

      item.addEventListener('click', () => {
        this.selectIsland(isl.id);
        this.playTone(620, 'sine', 0.1);
      });

      this.dom.dock.appendChild(item);
    });
  }

  // 選取並聚焦島嶼
  selectIsland(islandId) {
    this.selectedIslandId = islandId;
    const island = this.dataManager.getIslandById(islandId);
    if (!island) return;

    // 更新 Dock 啟動狀態
    document.querySelectorAll('.dock-item').forEach(b => {
      b.classList.toggle('active', b.dataset.islandId === islandId);
    });

    // 平滑平移相機聚焦該島嶼
    const { x, z } = axialToWorld(island.axial[0], island.axial[1]);
    const targetPos = new THREE.Vector3(x, HEIGHT + 0.5, z);
    const cameraPos = new THREE.Vector3(x + 5.5, HEIGHT + 6.0, z + 6.5);

    this.app.animateCameraTo(cameraPos, targetPos);

    // 展開右側即時醫療卡片
    this.openCard(island);
    this.playTone(520, 'triangle', 0.15);
  }

  // 開啟院區即時醫療卡片
  openCard(island) {
    if (!this.dom.card) return;

    this.dom.cardCategory.textContent = island.category || "醫學分院";
    this.dom.cardCategory.style.backgroundColor = island.themeColor || "#005bac";
    this.dom.cardTitle.textContent = island.name;
    this.dom.cardTagline.textContent = island.tagline || "";

    // 即時數據指標
    const rt = island.realtime || {};
    this.dom.cardStats.innerHTML = `
      <div class="stat-card">
        <span class="stat-label">急診等候人數</span>
        <span class="stat-value ${rt.erStatus === 'busy' ? 'warning' : 'good'}">${rt.erWaitCount ?? 0} <small>人</small></span>
        <span class="stat-tag">${rt.erStatusText || '良好'}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">今日預約看診</span>
        <span class="stat-value">${(rt.todayAppointments || 0).toLocaleString()} <small>人次</small></span>
        <span class="stat-tag">門診進行中</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">現有可用床位</span>
        <span class="stat-value highlight">${rt.availableBeds ?? rt.availableSuites ?? 60} <small>床</small></span>
        <span class="stat-tag">即時調配</span>
      </div>
    `;

    // 核心重點醫療中心
    this.dom.cardPillars.innerHTML = '';
    (island.pillars || []).forEach(p => {
      const div = document.createElement('div');
      div.className = 'pillar-item';
      div.innerHTML = `
        <div class="pillar-header">
          <span class="pillar-title">${p.title}</span>
          <span class="pillar-tag">${p.tag}</span>
        </div>
        <p class="pillar-desc">${p.desc}</p>
      `;
      this.dom.cardPillars.appendChild(div);
    });

    // 快速官方連結
    this.dom.cardLinks.innerHTML = '';
    (island.quickLinks || []).forEach(l => {
      const a = document.createElement('a');
      a.className = 'quick-link-btn';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `<span>${l.name}</span> <span class="arrow">↗</span>`;
      this.dom.cardLinks.appendChild(a);
    });

    this.dom.card.classList.add('visible');
  }

  closeCard() {
    if (this.dom.card) {
      this.dom.card.classList.remove('visible');
    }
    this.selectedIslandId = null;
    document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));
  }

  resetCamera() {
    const defaultCam = new THREE.Vector3(0, 16, 22);
    const defaultTarget = new THREE.Vector3(0, 0, 0);
    this.app.animateCameraTo(defaultCam, defaultTarget);
  }

  // 急診即時雷達彈窗
  openErRadarModal() {
    if (!this.dom.erModal) return;
    this.dom.erList.innerHTML = '';

    const islands = this.dataManager.getIslands();
    islands.forEach(isl => {
      const rt = isl.realtime;
      if (!rt || typeof rt.erWaitCount === 'undefined') return;

      const item = document.createElement('div');
      item.className = 'er-row';
      item.innerHTML = `
        <div class="er-branch">
          <span class="badge" style="background:${isl.themeColor}">${isl.number}</span>
          <strong>${isl.name}</strong>
        </div>
        <div class="er-col">等候看診: <strong>${rt.erWaitCount}</strong> 人</div>
        <div class="er-col">等待住院: <strong>${rt.erWaitHospitalize ?? '-'}</strong> 人</div>
        <div class="er-col">ICU 待床: <strong>${rt.erWaitIcu ?? '-'}</strong> 床</div>
        <div class="er-col status">
          <span class="status-pill ${rt.erStatus}">${rt.erStatusText}</span>
        </div>
        <button class="er-jump-btn" data-id="${isl.id}">前往視角</button>
      `;

      item.querySelector('.er-jump-btn').addEventListener('click', () => {
        this.closeErRadarModal();
        this.selectIsland(isl.id);
      });

      this.dom.erList.appendChild(item);
    });

    this.dom.erModal.classList.add('active');
    this.dom.erModal.removeAttribute('hidden');
    this.dom.erModal.style.display = 'flex';
  }

  closeErRadarModal() {
    if (!this.dom.erModal) return;
    this.dom.erModal.classList.remove('active');
    this.dom.erModal.setAttribute('hidden', '');
    this.dom.erModal.style.display = 'none';
  }

  listenDataUpdates() {
    this.dataManager.subscribe((event, payload) => {
      if (event === 'update' && payload.islandId === this.selectedIslandId) {
        const island = this.dataManager.getIslandById(this.selectedIslandId);
        if (island && this.dom.card.classList.contains('visible')) {
          this.openCard(island);
        }
      }
    });
  }

  // 輕巧的 Web Audio API 提示音合成
  playTone(freq = 440, type = 'sine', duration = 0.1) {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // 靜音處理
    }
  }
}
