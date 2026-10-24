/**
 * 長庚醫療島 (CGMH Medical Island) 常數與配置定義
 * 依據「政策島」設計架構改造之微縮模型醫療城市
 */

export const R = 2.4; // 六角形半徑
export const SPACING = 2.75; // 六角形間距
export const HEIGHT = 0.9; // 島嶼高度
export const RING_R = 2.1; // 島上環狀林蔭步道半徑
export const INNER_R = 1.6; // 核心建築基座半徑
export const SQ3 = Math.sqrt(3);

// 六角軸座標鄰居向量 (Axial Direction Vectors)
export const NEIGHBORS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
];

// 將六角軸座標 (q, r) 轉換為 3D 笛卡爾座標 (x, z)
export function axialToWorld(q, r) {
  const x = SPACING * SQ3 * (q + r / 2);
  const z = SPACING * 1.5 * r;
  return { x, z };
}

// 晝夜光影配置 (晨曦、正午、黃昏、幽夜)
export const TIME_MODES = {
  dawn: {
    name: "晨曦",
    timeStr: "06:00",
    skyColor: 0xffe4cc,
    horizonColor: 0xffd1b3,
    fogColor: 0xfde3d0,
    sunColor: 0xffb380,
    sunIntensity: 1.8,
    sunPosition: [30, 20, 25],
    ambientColor: 0xffe0cc,
    ambientIntensity: 0.9,
    hemiSky: 0xffd9b3,
    hemiGround: 0x90a4ae,
    windowGlow: 0.2,
    waterColor: 0x5b9aa0,
    waterOpacity: 0.82
  },
  day: {
    name: "正午",
    timeStr: "12:00",
    skyColor: 0xd6f0ff,
    horizonColor: 0xbfe5ff,
    fogColor: 0xcae9ff,
    sunColor: 0xfffaed,
    sunIntensity: 2.2,
    sunPosition: [15, 35, 18],
    ambientColor: 0xffffff,
    ambientIntensity: 1.1,
    hemiSky: 0xdcf2ff,
    hemiGround: 0xa4b0be,
    windowGlow: 0.0,
    waterColor: 0x3d94b8,
    waterOpacity: 0.85
  },
  dusk: {
    name: "黃昏",
    timeStr: "18:00",
    skyColor: 0xffb787,
    horizonColor: 0xf58f62,
    fogColor: 0xf49c74,
    sunColor: 0xff7b47,
    sunIntensity: 2.0,
    sunPosition: [-30, 16, 20],
    ambientColor: 0xf8b195,
    ambientIntensity: 0.8,
    hemiSky: 0xf8a585,
    hemiGround: 0x6c5b7b,
    windowGlow: 0.6,
    waterColor: 0x517281,
    waterOpacity: 0.85
  },
  night: {
    name: "幽夜",
    timeStr: "21:30",
    skyColor: 0x141e30,
    horizonColor: 0x243b55,
    fogColor: 0x18243b,
    sunColor: 0x82a6d4,
    sunIntensity: 0.6,
    sunPosition: [-20, 28, -15],
    ambientColor: 0x243048,
    ambientIntensity: 0.5,
    hemiSky: 0x20304c,
    hemiGround: 0x111625,
    windowGlow: 1.0,
    waterColor: 0x0f2b46,
    waterOpacity: 0.88
  }
};

// 島嶼地質與懸崖層級色彩 (微縮模型陶土感)
export const ISLAND_GEOLOGY = {
  cliffTones: [0xcca888, 0xbb9374, 0xaa7f60, 0x946b4e],
  grassTone: 0xa5cc82,
  pavementTone: 0xe6e2dd,
  curbTone: 0xd1ccc4,
  sandTone: 0xf0dfbe
};
