/**
 * 長庚醫療島 (CGMH Medical Island) 環境、光影與晝夜系統
 * 支援：晨曦 (06:00)、正午 (12:00)、黃昏 (18:00)、幽夜 (21:30) 的溫暖玩具光影
 */

import * as THREE from 'three';
import { TIME_MODES } from './cgmh_constants.js';

export class CGMHEnvironment {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.currentMode = 'day';
    this.clouds = [];

    this.initLights();
    this.initSkyAndFog();
    this.initClouds();
    this.applyTimeMode('day', true);
  }

  initLights() {
    // 1. 半球環境光 (模擬天空與地面漫反射)
    this.hemiLight = new THREE.HemisphereLight(0xdcf2ff, 0xa4b0be, 1.0);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // 2. 主方向陽光 (產生溫暖低多邊形陰影)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(15, 35, 18);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    const d = 25;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // 3. 環境輔助光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);
  }

  initSkyAndFog() {
    this.scene.fog = new THREE.FogExp2(0xcae9ff, 0.015);
  }

  // 漂浮的棉花糖低多邊形積木雲朵 (Low-poly Puffy Clouds)
  initClouds() {
    this.cloudsGroup = new THREE.Group();
    this.cloudsGroup.name = "clouds";
    this.scene.add(this.cloudsGroup);

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92
    });

    for (let i = 0; i < 9; i++) {
      const cloud = this.createSingleCloud(cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 50,
        9 + Math.random() * 4,
        (Math.random() - 0.5) * 50
      );
      this.cloudsGroup.add(cloud);
      this.clouds.push({
        mesh: cloud,
        speed: 0.35 + Math.random() * 0.25
      });
    }
  }

  createSingleCloud(mat) {
    const group = new THREE.Group();
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const radius = 0.8 + Math.random() * 0.6;
      const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), mat);
      sphere.position.set(
        (i - count / 2) * 0.7 + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      group.add(sphere);
    }
    return group;
  }

  // 平滑切換時段
  applyTimeMode(modeName) {
    const config = TIME_MODES[modeName] || TIME_MODES.day;
    this.currentMode = modeName;

    // 陽光
    this.sunLight.color.setHex(config.sunColor);
    this.sunLight.intensity = config.sunIntensity;
    this.sunLight.position.set(config.sunPosition[0], config.sunPosition[1], config.sunPosition[2]);

    // 環境光
    this.ambientLight.color.setHex(config.ambientColor);
    this.ambientLight.intensity = config.ambientIntensity;

    // 半球光
    this.hemiLight.color.setHex(config.hemiSky);
    this.hemiLight.groundColor.setHex(config.hemiGround);

    // 霧與背景色
    this.scene.background = new THREE.Color(config.skyColor);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(config.fogColor);
    }

    // 更新海洋顏色
    const ocean = this.scene.getObjectByName("ocean_plane");
    if (ocean && ocean.material) {
      ocean.material.color.setHex(config.waterColor);
      ocean.material.opacity = config.waterOpacity;
    }
  }

  update(delta) {
    // 雲朵徐徐漂浮
    this.clouds.forEach(c => {
      c.mesh.position.x += c.speed * delta;
      if (c.mesh.position.x > 35) {
        c.mesh.position.x = -35;
      }
    });
  }
}
