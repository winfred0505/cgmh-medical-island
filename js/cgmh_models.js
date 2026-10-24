/**
 * 長庚醫療島 (CGMH Medical Island) 微縮模型物件生成器
 * 風格：溫暖、圓角、微縮玩具模型（Toy Diorama Aesthetic）
 */

import * as THREE from 'three';

export class CGMHModelBuilder {
  constructor() {
    this.materials = this.initMaterials();
    this.animatedObjects = []; // 存儲需要在每幀旋轉或浮動的物件 (直升機螺旋槳、質子環、雷達)
  }

  initMaterials() {
    return {
      whiteHospital: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.35, metalness: 0.05 }),
      offWhite: new THREE.MeshStandardMaterial({ color: 0xefede6, roughness: 0.4 }),
      cgmhBlue: new THREE.MeshStandardMaterial({ color: 0x005bac, roughness: 0.3 }),
      cgmhLightBlue: new THREE.MeshStandardMaterial({ color: 0x2b87d1, roughness: 0.35 }),
      cgmhGreen: new THREE.MeshStandardMaterial({ color: 0x00875a, roughness: 0.4 }),
      tcmWood: new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.6 }),
      tcmRoof: new THREE.MeshStandardMaterial({ color: 0xc85a32, roughness: 0.5 }),
      warmOrange: new THREE.MeshStandardMaterial({ color: 0xf57c00, roughness: 0.4 }),
      softPink: new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.3 }),
      windowCyan: new THREE.MeshStandardMaterial({
        color: 0x81d4fa,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x29b6f6,
        emissiveIntensity: 0.2
      }),
      windowGlowNight: new THREE.MeshStandardMaterial({
        color: 0xfff59d,
        emissive: 0xffd54f,
        emissiveIntensity: 0.8
      }),
      crossRed: new THREE.MeshStandardMaterial({ color: 0xe53935, roughness: 0.3, emissive: 0xd32f2f, emissiveIntensity: 0.3 }),
      crossGreen: new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.3, emissive: 0x2e7d32, emissiveIntensity: 0.3 }),
      helipadYellow: new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.5 }),
      treeFoliage: new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.7 }),
      treeFoliageDark: new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.7 }),
      treeSakura: new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.6 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.8 }),
      asphalt: new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.8 }),
      metalChrome: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.2, metalness: 0.9 }),
      neonPurple: new THREE.MeshStandardMaterial({ color: 0x9c27b0, emissive: 0xab47bc, emissiveIntensity: 0.6 }),
      solarBlue: new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.1, metalness: 0.85 })
    };
  }

  // 根據島嶼類型建構其標誌性微縮建築聚落
  buildIslandScene(island) {
    const group = new THREE.Group();
    group.name = `island_model_${island.id}`;

    switch (island.modelType) {
      case 'flagship_hospital':
        this.buildLinkouFlagship(group, island);
        break;
      case 'urban_clinic':
        this.buildTaipeiUrban(group, island);
        break;
      case 'coastal_hospital':
        this.buildKeelungCoastal(group, island);
        break;
      case 'tcm_rehab_center':
        this.buildTaoyuanTCM(group, island);
        break;
      case 'retirement_village':
        this.buildCultureVillage(group, island);
        break;
      case 'kaohsiung_center':
        this.buildKaohsiungCenter(group, island);
        break;
      case 'chiayi_center':
        this.buildChiayiCenter(group, island);
        break;
      case 'coastal_care':
        this.buildYunlinCare(group, island);
        break;
      case 'ai_tech_hub':
        this.buildSmartAIHub(group, island);
        break;
      case 'charity_sanctuary':
        this.buildCharitySanctuary(group, island);
        break;
      default:
        this.buildGenericHospital(group, island);
    }

    // 周邊微縮植栽、路燈與庭院點綴
    this.addPerimeterFloraAndProps(group, island);

    return group;
  }

  // 1. 林口長庚總院：旗艦雙塔大樓 + 質子環 + 直升機停機坪
  buildLinkouFlagship(parent, island) {
    const root = new THREE.Group();

    // 裙樓基座
    const baseGeo = new THREE.BoxGeometry(1.9, 0.45, 1.5);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.whiteHospital);
    baseMesh.position.y = 0.225;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    root.add(baseMesh);

    // 主塔 (醫學大樓)
    const towerGeo = new THREE.BoxGeometry(0.85, 1.5, 0.75);
    const towerMesh = new THREE.Mesh(towerGeo, this.materials.whiteHospital);
    towerMesh.position.set(-0.35, 1.0, 0.1);
    towerMesh.castShadow = true;
    root.add(towerMesh);

    // 次塔 (研究大樓)
    const tower2Geo = new THREE.BoxGeometry(0.65, 1.1, 0.65);
    const tower2Mesh = new THREE.Mesh(tower2Geo, this.materials.cgmhBlue);
    tower2Mesh.position.set(0.45, 0.8, -0.15);
    tower2Mesh.castShadow = true;
    root.add(tower2Mesh);

    // 窗戶矩陣
    this.addWindowGrids(towerMesh, 0.85, 1.5, 0.75);

    // 紅十字招牌
    const cross = this.createRedCross();
    cross.position.set(-0.35, 1.85, 0.1);
    root.add(cross);

    // 質子治療中心加速器光環 (Proton Ring)
    const ringGeo = new THREE.TorusGeometry(0.45, 0.05, 12, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00b0ff,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const protonRing = new THREE.Mesh(ringGeo, ringMat);
    protonRing.position.set(0.55, 0.35, 0.5);
    protonRing.rotation.x = Math.PI / 2;
    root.add(protonRing);

    // 旋轉動態質子粒子
    this.animatedObjects.push({
      update: (delta) => {
        protonRing.rotation.z += delta * 1.5;
      }
    });

    // 直升機停機坪 (Helipad)
    const heliGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24);
    const heliMesh = new THREE.Mesh(heliGeo, this.materials.asphalt);
    heliMesh.position.set(-0.35, 1.76, 0.1);
    root.add(heliMesh);

    // 停機坪 "H" 標誌
    const hMark = this.createHMark();
    hMark.position.set(-0.35, 1.79, 0.1);
    root.add(hMark);

    // 微型緊急救護直升機
    const copter = this.createMiniHelicopter();
    copter.position.set(-0.35, 1.95, 0.1);
    root.add(copter);

    parent.add(root);
  }

  // 2. 台北長庚：精緻都會型醫療大樓
  buildTaipeiUrban(parent, island) {
    const root = new THREE.Group();

    // 玻璃幕牆都會大樓
    const mainGeo = new THREE.BoxGeometry(1.2, 1.4, 1.1);
    const mainMesh = new THREE.Mesh(mainGeo, this.materials.offWhite);
    mainMesh.position.y = 0.7;
    mainMesh.castShadow = true;
    root.add(mainMesh);

    this.addWindowGrids(mainMesh, 1.2, 1.4, 1.1);

    // 婦幼健康柔和弧形頂蓬
    const roofGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16);
    const roofMesh = new THREE.Mesh(roofGeo, this.materials.softPink);
    roofMesh.position.set(0, 1.48, 0);
    root.add(roofMesh);

    // 綠十字
    const cross = this.createGreenCross();
    cross.position.set(0, 1.62, 0);
    root.add(cross);

    parent.add(root);
  }

  // 3. 基隆長庚：依山傍水情人湖癌症卓越中心與微縮燈塔
  buildKeelungCoastal(parent, island) {
    const root = new THREE.Group();

    // 階梯式山海建築
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.9), this.materials.whiteHospital);
    b1.position.set(-0.15, 0.45, 0);
    b1.castShadow = true;
    root.add(b1);
    this.addWindowGrids(b1, 1.1, 0.9, 0.9);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), this.materials.cgmhGreen);
    b2.position.set(-0.15, 1.1, 0);
    root.add(b2);

    // 象徵臨海的情人湖微型燈塔
    const towerGeo = new THREE.CylinderGeometry(0.12, 0.22, 1.1, 16);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const lighthouse = new THREE.Mesh(towerGeo, towerMat);
    lighthouse.position.set(0.65, 0.55, 0.45);
    lighthouse.castShadow = true;
    root.add(lighthouse);

    const lampGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffea00, emissive: 0xffd600, emissiveIntensity: 0.9 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(0.65, 1.15, 0.45);
    root.add(lamp);

    // 旋轉光柱
    this.animatedObjects.push({
      update: (delta) => {
        lamp.rotation.y += delta * 2;
      }
    });

    parent.add(root);
  }

  // 4. 桃園長庚：中藥本草傳統中式飛簷大樓與運動復健池
  buildTaoyuanTCM(parent, island) {
    const root = new THREE.Group();

    // 中醫臨床大樓主體
    const mainGeo = new THREE.BoxGeometry(1.3, 0.8, 1.0);
    const mainMesh = new THREE.Mesh(mainGeo, this.materials.offWhite);
    mainMesh.position.y = 0.4;
    mainMesh.castShadow = true;
    root.add(mainMesh);
    this.addWindowGrids(mainMesh, 1.3, 0.8, 1.0);

    // 中式雙層瓦頂飛簷
    const roofGeo = new THREE.ConeGeometry(0.95, 0.45, 4);
    const roofMesh = new THREE.Mesh(roofGeo, this.materials.tcmRoof);
    roofMesh.position.set(0, 1.0, 0);
    roofMesh.rotation.y = Math.PI / 4;
    root.add(roofMesh);

    // 運動醫學迷你跑道 / 復健水療池
    const poolGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x4dd0e1, roughness: 0.1, metalness: 0.7 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(0.6, 0.05, 0.6);
    root.add(pool);

    parent.add(root);
  }

  // 5. 長庚養生文化村：高齡木屋聚落、綠蔭農園、微型風車
  buildCultureVillage(parent, island) {
    const root = new THREE.Group();

    // 中央樂齡活動會堂
    const hallGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16);
    const hallMesh = new THREE.Mesh(hallGeo, this.materials.warmOrange);
    hallMesh.position.set(0, 0.225, 0);
    hallMesh.castShadow = true;
    root.add(hallMesh);

    const domeGeo = new THREE.SphereGeometry(0.56, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, this.materials.tcmRoof);
    domeMesh.position.set(0, 0.45, 0);
    root.add(domeMesh);

    // 3棟彩色別墅木屋
    const cottagePositions = [
      [-0.6, 0.15, -0.5],
      [0.65, 0.15, -0.4],
      [-0.55, 0.15, 0.6]
    ];

    cottagePositions.forEach(pos => {
      const house = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), this.materials.offWhite);
      body.castShadow = true;
      house.add(body);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.22, 4), this.materials.tcmRoof);
      roof.position.y = 0.26;
      roof.rotation.y = Math.PI / 4;
      house.add(roof);

      house.position.set(pos[0], pos[1], pos[2]);
      root.add(house);
    });

    // 迷你養生風車
    const mill = this.createWindmill();
    mill.position.set(0.65, 0.2, 0.5);
    root.add(mill);

    parent.add(root);
  }

  // 6. 高雄長庚：陳肇隆換肝醫學大樓 + 兒童醫學中心
  buildKaohsiungCenter(parent, island) {
    const root = new THREE.Group();

    // 換肝卓越主樓 (氣派弧形雙子樓)
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.8), this.materials.whiteHospital);
    b1.position.set(-0.35, 0.65, 0);
    b1.castShadow = true;
    root.add(b1);
    this.addWindowGrids(b1, 0.8, 1.3, 0.8);

    // 兒童醫療七彩點綴樓
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.65), this.materials.warmOrange);
    b2.position.set(0.45, 0.45, -0.15);
    b2.castShadow = true;
    root.add(b2);

    // 象徵生命重生的彩色愛心雕塑
    const heart = this.createMiniHeart();
    heart.position.set(0.45, 1.05, -0.15);
    root.add(heart);

    // 紅十字標籤
    const cross = this.createRedCross();
    cross.position.set(-0.35, 1.45, 0);
    root.add(cross);

    parent.add(root);
  }

  // 7. 嘉義長庚：嘉南平原大跨度現代綠建築與遠距天線
  buildChiayiCenter(parent, island) {
    const root = new THREE.Group();

    const mainGeo = new THREE.BoxGeometry(1.4, 0.7, 1.1);
    const mainMesh = new THREE.Mesh(mainGeo, this.materials.whiteHospital);
    mainMesh.position.y = 0.35;
    mainMesh.castShadow = true;
    root.add(mainMesh);
    this.addWindowGrids(mainMesh, 1.4, 0.7, 1.1);

    // 綠建築太陽能斜頂
    const solarGeo = new THREE.BoxGeometry(1.3, 0.05, 0.6);
    const solarMesh = new THREE.Mesh(solarGeo, this.materials.solarBlue);
    solarMesh.position.set(0, 0.75, 0.15);
    solarMesh.rotation.x = 0.2;
    root.add(solarMesh);

    // 阿里山5G遠距通訊天線
    const mast = this.createAntennaMast();
    mast.position.set(-0.55, 0.7, -0.35);
    root.add(mast);

    parent.add(root);
  }

  // 8. 雲林長庚：沿海巡迴醫療車隊與長照防風林
  buildYunlinCare(parent, island) {
    const root = new THREE.Group();

    const main = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 0.9), this.materials.offWhite);
    main.position.y = 0.3;
    main.castShadow = true;
    root.add(main);
    this.addWindowGrids(main, 1.1, 0.6, 0.9);

    // 沿海巡迴醫療專車
    const van = this.createMiniAmbulance(0x43a047);
    van.position.set(0.45, 0.08, 0.55);
    root.add(van);

    // 沿海風力發電機
    const turbine = this.createWindTurbine();
    turbine.position.set(-0.6, 0, -0.55);
    root.add(turbine);

    parent.add(root);
  }

  // 9. 長庚智慧醫療與生醫研發島：AI立方體大腦 + 數據衛星皿
  buildSmartAIHub(parent, island) {
    const root = new THREE.Group();

    // 科技感AI中央立方體
    const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cubeMesh = new THREE.Mesh(cubeGeo, this.materials.neonPurple);
    cubeMesh.position.y = 0.55;
    cubeMesh.castShadow = true;
    root.add(cubeMesh);

    // 圍繞立方體的數據環
    const dataRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.03, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1 })
    );
    dataRing.position.set(0, 0.55, 0);
    dataRing.rotation.x = Math.PI / 3;
    root.add(dataRing);

    // 衛星通訊雷達碟 (Dish)
    const dish = this.createSatelliteDish();
    dish.position.set(0.55, 0.15, 0.55);
    root.add(dish);

    this.animatedObjects.push({
      update: (delta) => {
        cubeMesh.rotation.y += delta * 0.4;
        dataRing.rotation.z += delta * 1.0;
        dish.rotation.y += delta * 0.3;
      }
    });

    parent.add(root);
  }

  // 10. 全人社服與公益守護島：溫馨愛心之亭與身障畫廊
  buildCharitySanctuary(parent, island) {
    const root = new THREE.Group();

    // 愛心服務大廳
    const hallGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.45, 8);
    const hall = new THREE.Mesh(hallGeo, this.materials.softPink);
    hall.position.y = 0.225;
    hall.castShadow = true;
    root.add(hall);

    // 溫暖大心形雕塑
    const heart = this.createMiniHeart(0.35);
    heart.position.set(0, 0.65, 0);
    root.add(heart);

    // 微縮彩色戶外畫架 (身障畫家展區)
    const easel = this.createArtEasel();
    easel.position.set(0.55, 0.1, 0.45);
    root.add(easel);

    this.animatedObjects.push({
      update: (delta) => {
        heart.rotation.y += delta * 0.8;
      }
    });

    parent.add(root);
  }

  buildGenericHospital(parent, island) {
    const main = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.8), this.materials.whiteHospital);
    main.position.y = 0.4;
    parent.add(main);
    const cross = this.createRedCross();
    cross.position.set(0, 0.9, 0);
    parent.add(cross);
  }

  // === 輔助微縮幾何元件 ===

  createRedCross() {
    const g = new THREE.Group();
    const m = this.materials.crossRed;
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), m);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.08), m);
    g.add(v, h);
    return g;
  }

  createGreenCross() {
    const g = new THREE.Group();
    const m = this.materials.crossGreen;
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.08), m);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.08), m);
    g.add(v, h);
    return g;
  }

  createHMark() {
    const g = new THREE.Group();
    const m = this.materials.helipadYellow;
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.24), m);
    const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.24), m);
    const mid = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.04), m);
    l1.position.x = -0.06;
    l2.position.x = 0.06;
    g.add(l1, l2, mid);
    return g;
  }

  createMiniHelicopter() {
    const copter = new THREE.Group();
    // 機身
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.14), this.materials.crossRed);
    copter.add(body);

    // 尾樑
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), this.materials.whiteHospital);
    tail.position.set(-0.18, 0.02, 0);
    copter.add(tail);

    // 螺旋槳 (Rotor)
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.01, 0.04), this.materials.metalChrome);
    rotor.position.y = 0.1;
    copter.add(rotor);

    this.animatedObjects.push({
      update: (delta) => {
        rotor.rotation.y += delta * 20;
      }
    });

    copter.scale.set(0.8, 0.8, 0.8);
    return copter;
  }

  createMiniHeart(scale = 0.25) {
    const shape = new THREE.Shape();
    const x = -0.25, y = -0.5;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const mesh = new THREE.Mesh(geo, this.materials.crossRed);
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.PI;
    mesh.scale.set(scale, scale, scale);
    return mesh;
  }

  createWindmill() {
    const mill = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.5, 8), this.materials.offWhite);
    tower.position.y = 0.25;
    mill.add(tower);

    const blades = new THREE.Group();
    blades.position.set(0, 0.5, 0.12);
    for (let i = 0; i < 4; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.01), this.materials.tcmWood);
      b.rotation.z = (Math.PI / 2) * i;
      blades.add(b);
    }
    mill.add(blades);

    this.animatedObjects.push({
      update: (delta) => {
        blades.rotation.z += delta * 1.8;
      }
    });

    return mill;
  }

  createWindTurbine() {
    const turb = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.9, 8), this.materials.metalChrome);
    pole.position.y = 0.45;
    turb.add(pole);

    const blades = new THREE.Group();
    blades.position.set(0, 0.9, 0.06);
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.01), this.materials.whiteHospital);
      blade.rotation.z = (Math.PI * 2 / 3) * i;
      blades.add(blade);
    }
    turb.add(blades);

    this.animatedObjects.push({
      update: (delta) => {
        blades.rotation.z += delta * 2.2;
      }
    });

    return turb;
  }

  createSatelliteDish() {
    const dishGroup = new THREE.Group();
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.2, 8), this.materials.metalChrome);
    mount.position.y = 0.1;
    dishGroup.add(mount);

    const dishGeo = new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 3);
    const dish = new THREE.Mesh(dishGeo, this.materials.whiteHospital);
    dish.position.set(0, 0.2, 0);
    dish.rotation.x = Math.PI / 4;
    dishGroup.add(dish);

    return dishGroup;
  }

  createAntennaMast() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.7, 6), this.materials.metalChrome);
    pole.position.y = 0.35;
    g.add(pole);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 16), this.materials.neonPurple);
    ring.position.y = 0.55;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);

    return g;
  }

  createMiniAmbulance(color = 0xffffff) {
    const van = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.12), new THREE.MeshStandardMaterial({ color }));
    body.position.y = 0.06;
    van.add(body);

    const redStripe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.125), this.materials.crossRed);
    redStripe.position.y = 0.06;
    van.add(redStripe);

    return van;
  }

  createArtEasel() {
    const g = new THREE.Group();
    const canvas = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), new THREE.MeshStandardMaterial({ color: 0xffd54f }));
    canvas.position.y = 0.15;
    canvas.rotation.x = -0.15;
    g.add(canvas);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25), this.materials.tcmWood);
    leg.position.y = 0.12;
    g.add(leg);

    return g;
  }

  addWindowGrids(mesh, w, h, d) {
    const winMat = this.materials.windowCyan;
    const cols = 3;
    const rows = 4;
    const winW = (w / cols) * 0.45;
    const winH = (h / rows) * 0.35;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), winMat);
        const x = (c - (cols - 1) / 2) * (w / cols * 0.8);
        const y = (r - (rows - 1) / 2) * (h / rows * 0.8);
        win.position.set(x, y, d / 2 + 0.005);
        mesh.add(win);
      }
    }
  }

  addPerimeterFloraAndProps(parent, island) {
    // 圍繞島嶼周圍散佈微型可愛低多邊形積木樹木與小街燈
    const count = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radius = 1.6 + Math.random() * 0.4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const isPine = Math.random() > 0.5;
      const tree = isPine ? this.createPineTree() : this.createRoundTree(island.id === 'taipei');
      tree.position.set(x, 0, z);
      const scale = 0.7 + Math.random() * 0.4;
      tree.scale.set(scale, scale, scale);
      parent.add(tree);
    }
  }

  createPineTree() {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.25, 6), this.materials.treeTrunk);
    trunk.position.y = 0.125;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 6), this.materials.treeFoliageDark);
    foliage.position.y = 0.4;
    foliage.castShadow = true;
    tree.add(foliage);

    return tree;
  }

  createRoundTree(isSakura = false) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.22, 6), this.materials.treeTrunk);
    trunk.position.y = 0.11;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = isSakura ? this.materials.treeSakura : this.materials.treeFoliage;
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), foliageMat);
    foliage.position.y = 0.35;
    foliage.castShadow = true;
    tree.add(foliage);

    return tree;
  }

  update(delta) {
    this.animatedObjects.forEach(obj => obj.update(delta));
  }
}
