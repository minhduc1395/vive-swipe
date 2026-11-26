import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { buocBam, type TrangThaiPhat } from "@/components/cuon-3d/phat-khung";

const DUONG_DAN_GLB = "/thu-nghiem/ampoule-3d/LOPOE_ampoule_web_v2.glb";
const DUONG_DAN_DRACO = "/thu-nghiem/ampoule-3d/draco/";
const TEN_NAP_V2 = ["collar", "bulb", "pipette"];

export interface TrangThaiCanh {
  canh: 1 | 2 | 3;
  gocY: number;
  nhacNap: number;
  giotRoi: number;
  giotHien: number;
  dichX: number;
  tiLe: number;
}

const kep01 = (v: number) => Math.max(0, Math.min(1, v));
const muot = (t: number) => {
  const k = kep01(t);
  return k * k * (3 - 2 * k);
};

export function tinhTrangThaiCanh(tienTrinh: number): TrangThaiCanh {
  const p = kep01(tienTrinh);
  if (p < 0.33) {
    const t = muot(p / 0.33);
    return {
      canh: 1,
      gocY: Math.PI * t,
      nhacNap: 0,
      giotRoi: 0,
      giotHien: 0,
      dichX: 0,
      tiLe: 1,
    };
  }
  if (p < 0.66) {
    const t = kep01((p - 0.33) / 0.33);
    const nhacNap =
      t < 0.25 ? muot(t / 0.25) : t < 0.8 ? 1 : 1 - muot((t - 0.8) / 0.2);
    const giotRoi = kep01((t - 0.25) / 0.52);
    const giotHien =
      t > 0.22 && t < 0.82 ? Math.sin(Math.PI * kep01((t - 0.22) / 0.6)) : 0;
    return {
      canh: 2,
      gocY: Math.PI * (1 + muot(t)),
      nhacNap,
      giotRoi,
      giotHien,
      dichX: 0,
      tiLe: 1,
    };
  }
  const t = muot((p - 0.66) / 0.34);
  return {
    canh: 3,
    gocY: Math.PI * 2,
    nhacNap: 0,
    giotRoi: 0,
    giotHien: 0,
    dichX: -t,
    tiLe: 1 - 0.18 * t,
  };
}

export function coWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export interface ThongSoDoFps {
  fps: number;
  maxFrameMs: number;
  dpr: number;
  canh: 1 | 2 | 3;
  tienTrinh: number;
  trangThai: "khoi-tao" | "dang-nap" | "da-nap" | "loi";
}

export interface TuyChonCanh {
  canvas: HTMLCanvasElement;
  khung: HTMLElement;
  layTienTrinh: () => number;
  maxDpr?: number;
  onCanh?: (canh: 1 | 2 | 3) => void;
  onThongSo?: (s: ThongSoDoFps) => void;
  onLoiWebGL?: () => void;
}

declare global {
  interface Window {
    __w071Ampoule?: ThongSoDoFps;
  }
}

export function khoiTaoCanhAmpoule(opts: TuyChonCanh): () => void {
  const { canvas, khung, layTienTrinh, maxDpr, onCanh, onThongSo, onLoiWebGL } = opts;

  if (!coWebGL()) {
    onLoiWebGL?.();
    return () => {};
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    onLoiWebGL?.();
    return () => {};
  }

  const laMobile = window.innerWidth < 768;
  const gioiHanDpr = maxDpr ?? (laMobile ? 1.5 : 2);
  const dprThuc = Math.min(window.devicePixelRatio || 1, gioiHanDpr);
  renderer.setPixelRatio(dprThuc);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const rWithScale = renderer as THREE.WebGLRenderer & {
    transmissionResolutionScale?: number;
  };
  if (typeof rWithScale.transmissionResolutionScale === "number") {
    rWithScale.transmissionResolutionScale = 0.5;
  }

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0.05, 5.2);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
  keyLight.position.set(2.5, 4, 3.5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xdbe8ff, 0.7);
  fillLight.position.set(-3, 1, 2);
  scene.add(fillLight);

  const root = new THREE.Group();
  scene.add(root);

  const thanGroup = new THREE.Group();
  const napGroup = new THREE.Group();
  root.add(thanGroup);
  root.add(napGroup);

  // BoxGeometry placeholder for Part A step before GLB loads
  const boxThan = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.5, 0.9),
    new THREE.MeshStandardMaterial({
      color: 0x9ab8df,
      roughness: 0.25,
      metalness: 0.05,
    }),
  );
  boxThan.position.y = -0.2;
  thanGroup.add(boxThan);

  const boxNap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.65, 24),
    new THREE.MeshStandardMaterial({
      color: 0xeef1f5,
      roughness: 0.35,
      metalness: 0.05,
    }),
  );
  boxNap.position.y = 0.88;
  napGroup.add(boxNap);

  const giotMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshPhysicalMaterial({
      color: 0xcbe3ff,
      roughness: 0.08,
      transmission: 0.6,
      transparent: true,
      opacity: 0.9,
    }),
  );
  giotMesh.scale.set(0.85, 1.25, 0.85);
  giotMesh.visible = false;
  root.add(giotMesh);

  let canVeLai = true;

  const capNhatKichThuoc = () => {
    const w = Math.max(1, khung.clientWidth);
    const h = Math.max(1, khung.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    canVeLai = true;
  };
  capNhatKichThuoc();

  const ro = new ResizeObserver(capNhatKichThuoc);
  ro.observe(khung);

  const giamChuyenDong = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dangHien = true;
  const io = new IntersectionObserver(
    (entries) => {
      dangHien = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.01 },
  );
  io.observe(khung);

  let bam: TrangThaiPhat = { f: layTienTrinh() * 1000, v: 0 };
  let canhCu: 1 | 2 | 3 | null = null;
  let rafId = 0;
  let lastTs = performance.now();
  let soKhung = 0;
  let cuaSoBatDau = lastTs;
  let maxFrameMs = 0;
  let fpsHienTai = 0;
  let daHuy = false;
  let pVeCu = -1;

  const thongTin: ThongSoDoFps = {
    fps: 0,
    maxFrameMs: 0,
    dpr: dprThuc,
    canh: 1,
    tienTrinh: 0,
    trangThai: "dang-nap",
  };
  window.__w071Ampoule = thongTin;

  let yDauOng = 0.58;
  const draco = new DRACOLoader();
  draco.setDecoderPath(DUONG_DAN_DRACO);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  void loader
    .loadAsync(DUONG_DAN_GLB)
    .then((gltf) => {
      if (daHuy) return;
      const goc = gltf.scene;
      const tl = new THREE.Group();
      tl.add(goc);
      tl.updateMatrixWorld(true);

      const h0 = new THREE.Box3().setFromObject(goc);
      const c0 = h0.getCenter(new THREE.Vector3());
      const chieuCao = Math.max(1e-6, h0.max.y - h0.min.y);
      const tiLeChuan = 2.25 / chieuCao;
      tl.scale.setScalar(tiLeChuan);
      tl.position.set(-c0.x * tiLeChuan, -c0.y * tiLeChuan, -c0.z * tiLeChuan);
      tl.updateMatrixWorld(true);

      const dropper = goc.getObjectByName("Dropper");
      const phanNap = dropper
        ? [dropper]
        : TEN_NAP_V2.map((ten) => goc.getObjectByName(ten)).filter(
            (o): o is THREE.Object3D => !!o,
          );
      const napGlb = new THREE.Group();
      napGlb.name = "nap-glb";
      for (const node of phanNap) {
        napGlb.attach(node);
      }
      napGlb.updateMatrixWorld(true);

      const ong = goc.getObjectByName("pipette");
      if (ong) {
        yDauOng = new THREE.Box3().setFromObject(ong).min.y;
      }

      thanGroup.clear();
      napGroup.clear();
      thanGroup.add(tl);
      napGroup.add(napGlb);
      thongTin.trangThai = "da-nap";
      canVeLai = true;
      veKhung(bam.f / 1000);
    })
    .catch(() => {
      if (!daHuy) {
        thongTin.trangThai = "loi";
      }
    })
    .finally(() => {
      draco.dispose();
    });

  const veKhung = (p: number) => {
    const st = tinhTrangThaiCanh(p);
    root.rotation.y = st.gocY;
    const isDesktop = window.innerWidth >= 768;
    root.position.x = isDesktop ? (st.canh === 2 ? -0.45 : st.dichX * 0.72) : 0;
    root.position.y = isDesktop ? -0.12 : 0.16;
    root.scale.setScalar(st.tiLe * (isDesktop ? 0.88 : 0.76));

    napGroup.position.y = st.nhacNap * 0.55;
    giotMesh.visible = st.giotHien > 0.02;
    giotMesh.position.set(0, yDauOng + st.nhacNap * 0.55 - st.giotRoi * 0.7, 0);

    if (st.canh !== canhCu) {
      canhCu = st.canh;
      onCanh?.(st.canh);
    }
    thongTin.canh = st.canh;
    thongTin.tienTrinh = p;
    renderer.render(scene, camera);
  };

  veKhung(layTienTrinh());

  const vongLap = (now: number) => {
    if (daHuy) return;
    const dtMs = now - lastTs;
    const dt = Math.min(0.25, Math.max(0.001, dtMs / 1000));
    lastTs = now;

    if (dangHien) {
      const dich = layTienTrinh() * 1000;
      if (giamChuyenDong) {
        bam = { f: dich, v: 0 };
      } else {
        bam = buocBam(bam, dich, dt, { thoiGian: 0.1, toiDa: 3000 });
      }
      const pMoi = bam.f / 1000;
      if (canVeLai || Math.abs(pMoi - pVeCu) > 1e-5) {
        canVeLai = false;
        pVeCu = pMoi;
        const t0 = performance.now();
        veKhung(pMoi);
        const frameCost = performance.now() - t0;
        if (frameCost > maxFrameMs) maxFrameMs = Math.round(frameCost * 10) / 10;

        soKhung++;
        if (fpsHienTai === 0 && dtMs > 0) {
          fpsHienTai = Math.max(1, Math.round(1000 / dtMs));
          thongTin.fps = fpsHienTai;
          thongTin.maxFrameMs = maxFrameMs;
          onThongSo?.({ ...thongTin });
        } else if (now - cuaSoBatDau >= 500) {
          fpsHienTai = Math.max(1, Math.round((soKhung * 1000) / (now - cuaSoBatDau)));
          soKhung = 0;
          cuaSoBatDau = now;
          thongTin.fps = fpsHienTai;
          thongTin.maxFrameMs = maxFrameMs;
          onThongSo?.({ ...thongTin });
        }
      }
    }

    rafId = window.requestAnimationFrame(vongLap);
  };

  rafId = window.requestAnimationFrame(vongLap);

  return () => {
    daHuy = true;
    window.cancelAnimationFrame(rafId);
    io.disconnect();
    ro.disconnect();
    pmrem.dispose();
    envTex.dispose();
    renderer.dispose();
  };
}
