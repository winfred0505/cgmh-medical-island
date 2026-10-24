/**
 * 長庚醫療島 (CGMH Medical Island) 微縮交通與動態微角色模組
 * 包含：閃爍警示燈救護車、長庚經典綠色院際接駁專車、醫護小公仔與空中急救無人機
 */

import * as THREE from 'three';
import { R, HEIGHT, RING_R, axialToWorld } from './cgmh_constants.js';

export class CGMHTrafficSystem {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = [];
    this.drones = [];
    this.walkers = [];
    this.trafficGroup = new THREE.Group();
    this.trafficGroup.name = "city_traffic";
    this.scene.add(this.trafficGroup);

    this.materials = {
      ambulanceWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
      ambulanceStripe: new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.3 }),
      shuttleGreen: new THREE.MeshStandardMaterial({ color: 0x00875a, roughness: 0.3 }), // 長庚標準綠
      shuttleWhite: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 }),
      sirenRed: new THREE.MeshBasicMaterial({ color: 0xff1744 }),
      sirenBlue: new THREE.MeshBasicMaterial({ color: 0x00e5ff }),
      droneBody: new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.4 }),
      droneProp: new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.2 }),
      walkerDoctor: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
      walkerNurse: new THREE.MeshStandardMaterial({ color: 0xff80ab, roughness: 0.7 }),
      walkerHead: new THREE.MeshStandardMaterial({ color: 0xffcc80, roughness: 0.8 }),
      wheel: new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 })
    };
  }

  init(islands, flows) {
    // 1. 在主要醫院島嶼周圍放置環島行駛的微型救護車與接駁車
    islands.forEach(island => {
      const { x, z } = axialToWorld(island.axial[0], island.axial[1]);
      const center = new THREE.Vector3(x, HEIGHT + 0.1, z);

      if (['linkou', 'kaohsiung', 'taipei', 'keelung'].includes(island.id)) {
        // 救護車
        const amb = this.createAmbulanceMesh();
        this.trafficGroup.add(amb);
        this.vehicles.push({
          mesh: amb,
          type: 'ambulance',
          center,
          radius: RING_R,
          angle: Math.random() * Math.PI * 2,
          speed: 0.65 + Math.random() * 0.2,
          sirenLight: amb.userData.sirenLight
        });
      }

      if (['linkou', 'taoyuan', 'culture_village', 'chiayi'].includes(island.id)) {
        // 長庚院區接駁公車 (Shuttle Bus)
        const bus = this.createShuttleBusMesh();
        this.trafficGroup.add(bus);
        this.vehicles.push({
          mesh: bus,
          type: 'shuttle',
          center,
          radius: RING_R,
          angle: Math.random() * Math.PI * 2,
          speed: 0.45 + Math.random() * 0.15
        });
      }

      // 醫護散步公仔 (Walkers)
      for (let i = 0; i < 3; i++) {
        const walker = this.createWalkerMesh(i % 2 === 0);
        this.trafficGroup.add(walker);
        this.walkers.push({
          mesh: walker,
          center,
          radius: RING_R - 0.2,
          angle: Math.random() * Math.PI * 2,
          speed: 0.15 + Math.random() * 0.1,
          bobPhase: Math.random() * Math.PI
        });
      }
    });

    // 2. 在醫療協作線上建立巡迴飛行的器官運送無人機 (Medical Drones)
    flows.forEach(flow => {
      const drone = this.createMedicalDroneMesh();
      this.trafficGroup.add(drone);
      this.drones.push({
        mesh: drone,
        flowId: flow.id,
        t: Math.random(),
        speed: 0.12 + Math.random() * 0.08,
        curve: null // 會在 world 生成後綁定
      });
    });
  }

  // 綁定 Bezier 曲線給無人機
  bindFlowCurves(flowsGroup) {
    const lines = flowsGroup.children;
    this.drones.forEach((d, idx) => {
      if (lines[idx] && lines[idx].userData.curve) {
        d.curve = lines[idx].userData.curve;
      }
    });
  }

  // 微縮救護車 (Ambulance) 模型
  createAmbulanceMesh() {
    const car = new THREE.Group();

    // 車身
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.13, 0.13), this.materials.ambulanceWhite);
    body.position.y = 0.08;
    body.castShadow = true;
    car.add(body);

    // 紅色彩條
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.135), this.materials.ambulanceStripe);
    stripe.position.y = 0.08;
    car.add(stripe);

    // 4個小輪子
    const wheelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const wOffsets = [
      [-0.07, 0.035, 0.07],
      [-0.07, 0.035, -0.07],
      [0.07, 0.035, 0.07],
      [0.07, 0.035, -0.07]
    ];
    wOffsets.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, this.materials.wheel);
      w.position.set(pos[0], pos[1], pos[2]);
      car.add(w);
    });

    // 頂部紅藍雙色旋轉警報燈 (Siren Beacons)
    const sirenR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.04), this.materials.sirenRed);
    sirenR.position.set(0.02, 0.16, 0.03);
    const sirenB = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.04), this.materials.sirenBlue);
    sirenB.position.set(0.02, 0.16, -0.03);
    car.add(sirenR, sirenB);

    car.userData.sirenLight = { r: sirenR, b: sirenB };
    car.scale.set(1.2, 1.2, 1.2);
    return car;
  }

  // 長庚經典綠色院際接駁車 (Shuttle Bus)
  createShuttleBusMesh() {
    const bus = new THREE.Group();

    // 綠白相間車體
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.14), this.materials.shuttleGreen);
    lowerBody.position.y = 0.06;
    lowerBody.castShadow = true;
    bus.add(lowerBody);

    const upperBody = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.08, 0.135), this.materials.shuttleWhite);
    upperBody.position.y = 0.15;
    bus.add(upperBody);

    // 輪子
    const wheelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    const wOffsets = [
      [-0.12, 0.04, 0.075],
      [-0.12, 0.04, -0.075],
      [0.12, 0.04, 0.075],
      [0.12, 0.04, -0.075]
    ];
    wOffsets.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, this.materials.wheel);
      w.position.set(pos[0], pos[1], pos[2]);
      bus.add(w);
    });

    bus.scale.set(1.2, 1.2, 1.2);
    return bus;
  }

  // 醫療急救無人機 (Drone)
  createMedicalDroneMesh() {
    const drone = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.12), this.materials.droneBody);
    drone.add(body);

    // 紅十字急救保溫箱 (Organ Box)
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.07), this.materials.ambulanceStripe);
    box.position.y = -0.04;
    drone.add(box);

    // 4旋翼架與螺旋槳
    const propGeo = new THREE.BoxGeometry(0.08, 0.005, 0.015);
    const propOffsets = [
      [-0.07, 0.02, -0.07],
      [-0.07, 0.02, 0.07],
      [0.07, 0.02, -0.07],
      [0.07, 0.02, 0.07]
    ];

    drone.userData.props = [];
    propOffsets.forEach(pos => {
      const p = new THREE.Mesh(propGeo, this.materials.droneProp);
      p.position.set(pos[0], pos[1], pos[2]);
      drone.add(p);
      drone.userData.props.push(p);
    });

    drone.scale.set(1.3, 1.3, 1.3);
    return drone;
  }

  // 醫護迷你公仔
  createWalkerMesh(isDoctor = true) {
    const walker = new THREE.Group();

    // 身體 (醫生白袍 or 護理粉紅裝)
    const bodyGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6);
    const bodyMat = isDoctor ? this.materials.walkerDoctor : this.materials.walkerNurse;
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.06;
    walker.add(body);

    // 頭部
    const headGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const head = new THREE.Mesh(headGeo, this.materials.walkerHead);
    head.position.y = 0.14;
    walker.add(head);

    return walker;
  }

  update(delta, timeSeconds) {
    // 1. 更新車輛位置與警笛閃爍
    this.vehicles.forEach(v => {
      v.angle += v.speed * delta;
      const x = v.center.x + Math.cos(v.angle) * v.radius;
      const z = v.center.z + Math.sin(v.angle) * v.radius;
      v.mesh.position.set(x, v.center.y, z);

      // 車頭朝向切線方向
      v.mesh.rotation.y = -v.angle + Math.PI / 2;

      // 救護車警報燈交替閃爍
      if (v.sirenLight) {
        const flash = Math.sin(timeSeconds * 12) > 0;
        v.sirenLight.r.visible = flash;
        v.sirenLight.b.visible = !flash;
      }
    });

    // 2. 更新醫護散步公仔
    this.walkers.forEach(w => {
      w.angle += w.speed * delta;
      const x = w.center.x + Math.cos(w.angle) * w.radius;
      const z = w.center.z + Math.sin(w.angle) * w.radius;
      const bob = Math.sin(timeSeconds * 6 + w.bobPhase) * 0.015;
      w.mesh.position.set(x, w.center.y + bob, z);
      w.mesh.rotation.y = -w.angle + Math.PI / 2;
    });

    // 3. 更新空中無人機沿著 Bezier 曲線巡邏
    this.drones.forEach(d => {
      if (!d.curve) return;
      d.t = (d.t + d.speed * delta) % 1.0;
      const point = d.curve.getPoint(d.t);
      d.mesh.position.copy(point);

      // 旋翼旋轉
      if (d.mesh.userData.props) {
        d.mesh.userData.props.forEach(p => {
          p.rotation.y += delta * 30;
        });
      }
    });
  }
}
