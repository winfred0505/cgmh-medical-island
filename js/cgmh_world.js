/**
 * 長庚醫療島 (CGMH Medical Island) 地形與群島結構生成器
 * 產出六角形島嶼、懸崖分層、環島林蔭道、跨島拱橋與跨院流線
 */

import * as THREE from 'three';
import { R, HEIGHT, RING_R, INNER_R, axialToWorld, NEIGHBORS, ISLAND_GEOLOGY } from './cgmh_constants.js';

export class CGMHWorldBuilder {
  constructor(scene, modelBuilder) {
    this.scene = scene;
    this.modelBuilder = modelBuilder;
    this.islandMeshes = new Map(); // islandId -> Group
    this.bridgesGroup = new THREE.Group();
    this.bridgesGroup.name = "medical_bridges";
    this.flowsGroup = new THREE.Group();
    this.flowsGroup.name = "medical_flows";

    this.scene.add(this.bridgesGroup);
    this.scene.add(this.flowsGroup);

    this.materials = {
      water: new THREE.MeshStandardMaterial({
        color: 0x3d94b8,
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85
      }),
      bridgeDeck: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4
      }),
      bridgeRailing: new THREE.MeshStandardMaterial({
        color: 0x005bac,
        roughness: 0.3
      })
    };
  }

  // 建立整個長庚醫療群島世界
  buildWorld(islands, flows) {
    // 1. 建立海洋基底平面
    this.buildOcean();

    // 2. 建立各六角形島嶼
    islands.forEach(island => {
      const islandGroup = this.buildSingleIsland(island);
      this.islandMeshes.set(island.id, islandGroup);
      this.scene.add(islandGroup);
    });

    // 3. 建立相鄰島嶼之間的跨島連通拱橋
    this.buildInterIslandBridges(islands);

    // 4. 建立醫療協作弧形光脈流線 (Bezier Flow Curves)
    this.buildFlowLines(flows, islands);
  }

  // 1. 海洋平面
  buildOcean() {
    const geo = new THREE.PlaneGeometry(120, 120, 48, 48);
    const ocean = new THREE.Mesh(geo, this.materials.water);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.05;
    ocean.receiveShadow = true;
    ocean.name = "ocean_plane";
    this.scene.add(ocean);
  }

  // 2. 單一六角形島嶼生成
  buildSingleIsland(island) {
    const group = new THREE.Group();
    group.name = `island_${island.id}`;
    group.userData = { islandId: island.id, islandData: island };

    const { x, z } = axialToWorld(island.axial[0], island.axial[1]);
    group.position.set(x, 0, z);

    // 六角形擠出造型 (Pointy-top Hexagon)
    const hexShape = this.createHexagonShape(R);

    // 懸崖底座分層 (Cliff Strata)
    const cliffDepth = HEIGHT;
    const extrudeSettings = {
      depth: cliffDepth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const cliffGeo = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    cliffGeo.rotateX(Math.PI / 2); // 調整為 Y 軸向上

    // 依據島嶼主題色混合溫暖陶土色
    const islandColor = new THREE.Color(island.themeColor || 0x005bac);
    const cliffColor = new THREE.Color(ISLAND_GEOLOGY.cliffTones[0]).lerp(islandColor, 0.15);

    const cliffMat = new THREE.MeshStandardMaterial({
      color: cliffColor,
      roughness: 0.8,
      metalness: 0.05
    });

    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.y = 0;
    cliffMesh.receiveShadow = true;
    cliffMesh.castShadow = true;
    group.add(cliffMesh);

    // 島嶼表面綠地草坪 (Top Lawn)
    const topShape = this.createHexagonShape(R - 0.15);
    const topGeo = new THREE.ShapeGeometry(topShape);
    topGeo.rotateX(-Math.PI / 2);

    const topMat = new THREE.MeshStandardMaterial({
      color: ISLAND_GEOLOGY.grassTone,
      roughness: 0.7,
      metalness: 0.0
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = cliffDepth + 0.085;
    topMesh.receiveShadow = true;
    group.add(topMesh);

    // 環島林蔭步道 (Ring Walkway)
    const ringGeo = new THREE.RingGeometry(RING_R - 0.15, RING_R + 0.1, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: ISLAND_GEOLOGY.pavementTone,
      roughness: 0.6
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = cliffDepth + 0.088;
    ringMesh.receiveShadow = true;
    group.add(ringMesh);

    // 核心建築基座 (Center Plaza)
    const plazaGeo = new THREE.CircleGeometry(INNER_R, 24);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: ISLAND_GEOLOGY.curbTone,
      roughness: 0.5
    });
    const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
    plazaMesh.position.y = cliffDepth + 0.09;
    plazaMesh.receiveShadow = true;
    group.add(plazaMesh);

    // 加入專屬微縮建築群
    const modelGroup = this.modelBuilder.buildIslandScene(island);
    modelGroup.position.y = cliffDepth + 0.09;
    group.add(modelGroup);

    // 建立透明點擊碰撞膠囊/六角形，方便滑鼠射線檢測
    const pickGeo = new THREE.CylinderGeometry(R, R, HEIGHT + 2.5, 6);
    const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
    const pickMesh = new THREE.Mesh(pickGeo, pickMat);
    pickMesh.position.y = (HEIGHT + 2.5) / 2;
    pickMesh.name = `hit_${island.id}`;
    pickMesh.userData = { isIslandHit: true, islandId: island.id };
    group.add(pickMesh);

    return group;
  }

  // 產生正六角形 2D Shape
  createHexagonShape(radius) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6; // pointy-top
      const px = radius * Math.cos(angle);
      const py = radius * Math.sin(angle);
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    }
    shape.closePath();
    return shape;
  }

  // 3. 建立相鄰島嶼之間的跨島連通拱橋
  buildInterIslandBridges(islands) {
    const islandCoordMap = new Map();
    islands.forEach(isl => {
      islandCoordMap.set(`${isl.axial[0]},${isl.axial[1]}`, isl);
    });

    const builtPairs = new Set();

    islands.forEach(isl => {
      const [q1, r1] = isl.axial;
      const pos1 = axialToWorld(q1, r1);

      NEIGHBORS.forEach(([dq, dr]) => {
        const q2 = q1 + dq;
        const r2 = r1 + dr;
        const key = `${q2},${r2}`;

        if (islandCoordMap.has(key)) {
          const isl2 = islandCoordMap.get(key);
          const pairKey = [isl.id, isl2.id].sort().join('--');

          if (!builtPairs.has(pairKey)) {
            builtPairs.add(pairKey);
            const pos2 = axialToWorld(q2, r2);
            this.createBridge(pos1, pos2, isl.themeColor, isl2.themeColor);
          }
        }
      });
    });
  }

  createBridge(p1, p2, color1, color2) {
    const dir = new THREE.Vector3(p2.x - p1.x, 0, p2.z - p1.z);
    const dist = dir.length();
    const mid = new THREE.Vector3((p1.x + p2.x) / 2, HEIGHT + 0.1, (p1.z + p2.z) / 2);

    const bridge = new THREE.Group();
    bridge.position.copy(mid);

    const angle = Math.atan2(dir.x, dir.z);
    bridge.rotation.y = angle;

    // 拱橋甲板 (長度扣掉島面邊緣)
    const deckLen = dist - R * 1.5;
    if (deckLen <= 0.2) return;

    const deckGeo = new THREE.BoxGeometry(0.5, 0.08, deckLen);
    const deck = new THREE.Mesh(deckGeo, this.materials.bridgeDeck);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridge.add(deck);

    // 兩側長庚藍護欄
    const railMat = new THREE.MeshStandardMaterial({ color: 0x005bac, roughness: 0.3 });
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, deckLen), railMat);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, deckLen), railMat);
    rail1.position.set(-0.24, 0.08, 0);
    rail2.position.set(0.24, 0.08, 0);
    bridge.add(rail1, rail2);

    this.bridgesGroup.add(bridge);
  }

  // 4. 建立醫療協作弧形光脈流線 (Bezier Flow Curves)
  buildFlowLines(flows, islands) {
    const islandMap = new Map(islands.map(i => [i.id, i]));

    flows.forEach(flow => {
      const fromIsl = islandMap.get(flow.from);
      const toIsl = islandMap.get(flow.to);
      if (!fromIsl || !toIsl) return;

      const p1 = axialToWorld(fromIsl.axial[0], fromIsl.axial[1]);
      const p2 = axialToWorld(toIsl.axial[0], toIsl.axial[1]);

      const v1 = new THREE.Vector3(p1.x, HEIGHT + 0.8, p1.z);
      const v2 = new THREE.Vector3(p2.x, HEIGHT + 0.8, p2.z);

      // 向上隆起的拱弧中點
      const midX = (v1.x + v2.x) / 2;
      const midZ = (v1.z + v2.z) / 2;
      const dist = v1.distanceTo(v2);
      const midY = HEIGHT + 0.8 + Math.min(2.5, dist * 0.45);
      const vMid = new THREE.Vector3(midX, midY, midZ);

      const curve = new THREE.QuadraticBezierCurve3(v1, vMid, v2);
      const points = curve.getPoints(36);

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({
        color: new THREE.Color(flow.color || 0x29b6f6),
        linewidth: 2,
        dashSize: 0.35,
        gapSize: 0.18,
        transparent: true,
        opacity: 0.8
      });

      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      line.userData = { flowData: flow, curve };
      this.flowsGroup.add(line);
    });
  }

  setFlowsVisible(visible) {
    this.flowsGroup.visible = visible;
  }
}
