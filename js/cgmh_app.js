/**
 * 長庚醫療島 (CGMH Medical Island) 主應用程式核心
 * 整合 Three.js 場景、模型、世界群島、環境光影、交通網絡與 UI 系統
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CGMHDataManager } from './cgmh_data.js';
import { CGMHModelBuilder } from './cgmh_models.js';
import { CGMHWorldBuilder } from './cgmh_world.js';
import { CGMHEnvironment } from './cgmh_environment.js';
import { CGMHTrafficSystem } from './cgmh_traffic.js';
import { CGMHUIManager } from './cgmh_ui.js';

export class CGMHApp {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.clock = new THREE.Clock();
    this.autoRotate = false;

    // 相機平滑過渡目標
    this.targetCameraPos = null;
    this.targetLookAt = null;

    this.initThree();
    this.initModules();
  }

  initThree() {
    // 1. 場景
    this.scene = new THREE.Scene();

    // 2. 相機 (微縮移軸視角)
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 16, 22);

    // 3. 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. 控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2.15; // 防止穿透水面
    this.controls.minDistance = 6;
    this.controls.maxDistance = 45;
    this.controls.target.set(0, 0, 0);

    // 監聽視窗尺寸改變
    window.addEventListener('resize', () => this.onWindowResize());
  }

  async initModules() {
    // 資料管理
    this.dataManager = new CGMHDataManager();
    await this.dataManager.load();

    const islands = this.dataManager.getIslands();
    const flows = this.dataManager.getFlows();

    // 模型建立器
    this.modelBuilder = new CGMHModelBuilder();

    // 世界群島
    this.worldBuilder = new CGMHWorldBuilder(this.scene, this.modelBuilder);
    this.worldBuilder.buildWorld(islands, flows);

    // 環境光影與晝夜系統
    this.environment = new CGMHEnvironment(this.scene, this.renderer);

    // 微縮交通系統 (救護車、接駁車、醫護公仔、急救無人機)
    this.traffic = new CGMHTrafficSystem(this.scene);
    this.traffic.init(islands, flows);
    this.traffic.bindFlowCurves(this.worldBuilder.flowsGroup);

    // 互動 UI
    this.ui = new CGMHUIManager(this, this.dataManager);

    // 隱藏載入提示
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.style.display = 'none', 500);
    }

    // 啟動主渲染迴圈
    this.animate();
  }

  animateCameraTo(camPos, lookTarget) {
    this.targetCameraPos = camPos.clone();
    this.targetLookAt = lookTarget.clone();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 更新模型內部動畫 (直升機旋翼、質子環、風車)
    if (this.modelBuilder) {
      this.modelBuilder.update(delta);
    }

    // 更新交通動態 (救護車、接駁專車、巡邏無人機)
    if (this.traffic) {
      this.traffic.update(delta, time);
    }

    // 更新環境雲朵
    if (this.environment) {
      this.environment.update(delta);
    }

    // 平滑相機聚焦插值 (Lerp)
    if (this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetLookAt, 0.05);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.targetCameraPos = null;
        this.targetLookAt = null;
      }
    }

    // 自動旋轉
    if (this.autoRotate && !this.targetCameraPos) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.8;
    } else {
      this.controls.autoRotate = false;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// 頁面載入完成後啟動應用
window.addEventListener('DOMContentLoaded', () => {
  window.cgmhApp = new CGMHApp();
});
