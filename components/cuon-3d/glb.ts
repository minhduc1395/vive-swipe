/**
 * W073 (#150): nạp mô hình GLB (Draco, texture WebP) cho khối cuộn LOPOE và dựng chai ampoule / tuýp theo đơn vị cảnh.
 * File này chỉ được import động khi công tắc `glb` bật (canh.ts), nên tắt công tắc thì không tải GLTFLoader / Draco.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/** Bộ giải mã Draco chép từ node_modules/three/examples/jsm/libs/draco/gltf/ */
export const DUONG_DAN_DRACO = "/lopoe-3d-glb/draco/";

/** Trạng thái nạp ghi ra window.__lopoeGlb (cho e2e): "dang-nap" → "da-nap" | "loi". */
export type TrangThaiGlb = "dang-nap" | "da-nap" | "loi";
export const ghiTrangThai = (t: TrangThaiGlb) => { (window as unknown as { __lopoeGlb?: TrangThaiGlb }).__lopoeGlb = t; };

let draco: DRACOLoader | null = null;
let soDangNap = 0;

/** Nạp 1 file GLB, trả về scene gốc. Bộ giải mã Draco dùng chung giữa các file, giải phóng khi nạp xong hết. */
export async function napGlb(url: string): Promise<THREE.Group> {
  if (!draco) { draco = new DRACOLoader(); draco.setDecoderPath(DUONG_DAN_DRACO); }
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  soDangNap++;
  try {
    return (await loader.loadAsync(url)).scene;
  } finally {
    if (--soDangNap === 0) { draco?.dispose(); draco = null; }
  }
}

/** Đánh dấu vật liệu của mô hình: datMo (canh.ts) giữ depthWrite cho vật liệu này (thủy tinh, ống, nhãn vẽ đúng thứ tự). */
function danhDauVatLieu(goc: THREE.Object3D) {
  goc.traverse((o) => {
    const m = (o as THREE.Mesh).material;
    if (!m) return;
    for (const mt of Array.isArray(m) ? m : [m]) mt.userData.glb = true;
  });
}

const hop = (o: THREE.Object3D) => new THREE.Box3().setFromObject(o);

/**
 * Chai ampoule từ GLB GD-002: mesh `bottle_glass`, `liquid`, `label` (thân) và `collar`, `bulb`, `pipette` (nắp nhỏ giọt).
 * Bản v3 có node `Dropper` thì dùng thẳng node đó làm nắp.
 * Đơn vị trả về là đơn vị cảnh trong nhóm ampoule (đáy chai ở y = day, giữa chai ở x = z = 0).
 */
export interface ChaiGlb {
  than: THREE.Group;
  /** Nắp nhỏ giọt: nhóm đặt ở gốc toạ độ nhóm ampoule; dời nhóm này để nhấc nắp. */
  nap: THREE.Group;
  /** y miệng chai (đỉnh thân thủy tinh) */
  mieng: number;
  /** y đầu ống nhỏ giọt khi đóng nắp */
  dauOng: number;
  /** y đỉnh nắp khi đóng */
  dinh: number;
  /** nửa bề rộng chai */
  nuaRong: number;
}

const TEN_NAP = ["collar", "bulb", "pipette"];

export function dungChaiAmpoule(goc: THREE.Group, cao: number, day: number): ChaiGlb {
  danhDauVatLieu(goc);
  const tl = new THREE.Group();
  tl.add(goc);
  tl.updateMatrixWorld(true);
  const h0 = hop(goc), c0 = h0.getCenter(new THREE.Vector3());
  const s = cao / Math.max(1e-6, h0.max.y - h0.min.y);
  tl.scale.setScalar(s);
  tl.position.set(-c0.x * s, day - h0.min.y * s, -c0.z * s);
  tl.updateMatrixWorld(true);

  // Nắp: node Dropper (v3) hoặc gom collar + bulb + pipette (v2). attach giữ nguyên vị trí (tl và nap chưa có cha).
  const dropper = goc.getObjectByName("Dropper");
  const ong = goc.getObjectByName("pipette") ?? null;
  const phanNap = dropper ? [dropper] : TEN_NAP.map((t) => goc.getObjectByName(t)).filter((o): o is THREE.Object3D => !!o);
  const nap = new THREE.Group();
  nap.name = "nap-glb";
  for (const o of phanNap) nap.attach(o);
  nap.updateMatrixWorld(true);

  const hopThan = hop(tl), hopNap = phanNap.length ? hop(nap) : null;
  const kinh = goc.getObjectByName("bottle_glass");
  const mieng = kinh ? hop(kinh).max.y : hopThan.max.y;
  const dauOng = ong ? hop(ong).min.y : hopNap?.min.y ?? mieng;
  const dinh = Math.max(hopThan.max.y, hopNap?.max.y ?? -Infinity);
  const nuaRong = Math.max(Math.abs(hopThan.min.x), Math.abs(hopThan.max.x));
  const than = new THREE.Group();
  than.name = "than-glb";
  than.add(tl);
  return { than, nap, mieng, dauOng, dinh, nuaRong };
}

/** Tuýp từ GLB GD-003 (mesh `cap` là nắp): chia tỷ lệ cho bằng chiều cao `cao`, đặt giữa gốc toạ độ như ảnh tuýp. */
export function dungTuyp(goc: THREE.Group, cao: number): THREE.Group {
  danhDauVatLieu(goc);
  const tl = new THREE.Group();
  tl.add(goc);
  tl.updateMatrixWorld(true);
  const h0 = hop(goc), c0 = h0.getCenter(new THREE.Vector3());
  const s = cao / Math.max(1e-6, h0.max.y - h0.min.y);
  tl.scale.setScalar(s);
  tl.position.set(-c0.x * s, -c0.y * s, -c0.z * s);
  const g = new THREE.Group();
  g.name = "tuyp-glb";
  g.add(tl);
  return g;
}
