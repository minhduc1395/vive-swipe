/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cảnh three.js của khối cuộn 3D LOPOE (W054). Port từ design/lopoe-3d/index.html.
 * Không chứa chữ: chữ là HTML (components/cuon-3d/CuonLopoe3D.tsx). Cảnh chỉ nhận tiến trình p (0→1).
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type TuThe = { x: number; y: number; s: number; ry: number; rz: number; z: number; o: number };
type Khoa = [number, TuThe, TuThe | null];

const kep = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const muot = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => muot(kep((p - a) / (b - a)));
const T = (x: number, y: number, s = 1, ry = 0, rz = 0, z = 0, o = 1): TuThe => ({ x, y, s, ry, rz, z, o });
const K = (p: number, d: TuThe, m?: TuThe): Khoa => [p, d, m ?? null];
const tuDong = (s: TuThe) => T(s.x * 0.32, 0.32 + s.y * 0.42, s.s * 0.72, s.ry, s.rz, s.z, s.o);

const BO3 = {
  srm: [T(-0.3, -0.16, 1, 0.18, 0), T(-0.56, -0.02, 0.7, 0.18, 0)] as const,
  amp: [T(0, -0.2, 1, 0, 0), T(0, -0.06, 0.7, 0, 0)] as const,
  kem: [T(0.3, -0.16, 1, -0.18, 0), T(0.56, -0.02, 0.7, -0.18, 0)] as const,
};
const AMP_CUOI = [{ ...BO3.amp[0], ry: Math.PI * 4 }, { ...BO3.amp[1], ry: Math.PI * 4 }] as const;

/** Kịch bản: mốc giống design/lopoe-3d (xem chú thích trong file đó). */
export const KHOA: Record<"srm" | "amp" | "kem", Khoa[]> = {
  srm: [
    K(0, ...BO3.srm), K(0.045, ...BO3.srm),
    K(0.075, T(-0.42, -0.02, 1.32, -0.2, 0.08)),
    K(0.155, T(-0.4, 0.02, 1.32, 0.22, -0.04)),
    K(0.185, T(0, -0.04, 1.2, 0, 0)),
    K(0.27, T(0, 0, 1.2, 0, 0)),
    K(0.3, T(0.42, -0.02, 1.3, -0.2, -0.24)),
    K(0.37, T(0.44, 0.02, 1.3, 0.2, -0.18)),
    K(0.42, T(1.1, 1.0, 0.8, 0.5, -0.9, -1, 0), T(1.6, 1.6, 0.6, 0.5, -0.9, -1, 0)),
    K(0.87, T(1.1, 1.0, 0.8, 0.5, -0.9, -1, 0), T(1.6, 1.6, 0.6, 0.5, -0.9, -1, 0)),
    K(0.94, ...BO3.srm), K(1, ...BO3.srm),
  ],
  amp: [
    K(0, ...BO3.amp), K(0.045, ...BO3.amp),
    K(0.075, T(0, -0.5, 0.5, 0, 0, -6, 0), T(0, -0.3, 0.4, 0, 0, -6, 0)),
    K(0.36, T(0.3, -1.6, 1.3, -1.6, 0, 0, 0), T(0, -1.6, 0.9, -1.6, 0, 0, 0)),
    K(0.37, T(0.3, -1.6, 1.3, -1.6, 0, 0, 1), T(0, -1.6, 0.9, -1.6, 0, 0, 1)),
    K(0.42, T(0.3, -0.03, 1.3, 0, 0), T(0, 0.04, 0.8, 0, 0)),
    K(0.5, T(0.3, -0.01, 1.3, 0, 0), T(0, 0.05, 0.8, 0, 0)),
    K(0.53, T(-0.42, -0.02, 1.3, -0.5, 0), T(-0.38, 0.26, 0.8, -0.5, 0)),
    K(0.62, T(-0.42, 0.01, 1.3, 0.5, 0), T(-0.38, 0.28, 0.8, 0.5, 0)),
    K(0.65, T(0, -0.06, 1.5, 0, 0)),
    K(0.72, T(0, -0.04, 1.5, Math.PI * 2, 0)),
    K(0.77, T(-0.6, 0.1, 0.4, Math.PI * 3, 0, -8, 0)),
    K(0.87, T(-0.6, 0.1, 0.4, Math.PI * 3, 0, -8, 0)),
    K(0.94, ...AMP_CUOI), K(1, ...AMP_CUOI),
  ],
  kem: [
    K(0, ...BO3.kem), K(0.045, ...BO3.kem),
    K(0.075, T(0.65, -0.5, 0.6, -0.6, 0.3, -5, 0), T(1.2, -0.5, 0.5, -0.6, 0.3, -5, 0)),
    K(0.715, T(0.05, 1.6, 1.2, 0, 0.9, 0, 0), T(-0.25, 1.7, 0.8, 0, 0.9, 0, 0)),
    K(0.72, T(0.05, 1.6, 1.2, 0, 0.9, 0, 1), T(-0.25, 1.7, 0.8, 0, 0.9, 0, 1)),
    K(0.745, T(0.05, 0.09, 1.2, 0, 0.42), T(-0.25, 0.24, 0.8, 0, 0.42)),
    K(0.758, T(0.05, 0.2, 1.2, 0, 0.6), T(-0.25, 0.33, 0.8, 0, 0.6)),
    K(0.77, T(0.05, 0.18, 1.2, 0, 0.55), T(-0.25, 0.3, 0.8, 0, 0.5)),
    K(0.87, T(0.05, 0.2, 1.2, 0, 0.58), T(-0.25, 0.32, 0.8, 0, 0.53)),
    K(0.94, ...BO3.kem), K(1, ...BO3.kem),
  ],
};

export function noiSuy(keys: Khoa[], p: number, dt: boolean): TuThe {
  const lay = (k: Khoa) => (dt ? k[2] ?? tuDong(k[1]) : k[1]);
  if (p <= keys[0][0]) return lay(keys[0]);
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const a = lay(keys[i - 1]), b = lay(keys[i]);
      const t = muot((p - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0] || 1));
      const r = {} as TuThe;
      for (const k of Object.keys(a) as (keyof TuThe)[]) r[k] = a[k] + (b[k] - a[k]) * t;
      return r;
    }
  }
  return lay(keys[keys.length - 1]);
}

export type LoaiHat = "thua" | "sen" | "phan-tu" | "rau-ma" | "xoan";
export interface TaiSan { ampoule_glb: string; sua_rua_mat: string; kem_duong: string }
export interface ViTriNhan { x: number; y: number; o: number }

export interface Canh {
  ve: (p: number, time: number) => { srm: ViTriNhan[]; amp: ViTriNhan[] };
  doiCo: () => void;
  huy: () => void;
}

export function taoCanh(
  canvas: HTMLCanvasElement,
  opts: { taiSan: TaiSan; hatSrm: LoaiHat[]; hatAmp: LoaiHat[]; so1: string; hienSo1?: boolean; giamChuyenDong: boolean; onSanSang?: () => void },
): Canh {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const dt0 = window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dt0 ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8d2cc, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 5, 6);
  scene.add(key);

  // Nền mềm đổi màu theo chương
  const nenMat = new THREE.ShaderMaterial({
    uniforms: { uA: { value: new THREE.Color("#F7EEEB") }, uB: { value: new THREE.Color("#F3DED8") }, uC: { value: new THREE.Vector2(0, -0.1) } },
    vertexShader: "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:
      "varying vec2 vUv; uniform vec3 uA; uniform vec3 uB; uniform vec2 uC; void main(){ vec2 q=vUv*2.-1.; float d=length((q-uC)*vec2(1.,1.25)); vec3 c=mix(uB,uA,smoothstep(.0,1.15,d)); float d2=length(q-vec2(-uC.x*.8,.65)); c=mix(c,vec3(1.),smoothstep(1.1,.0,d2)*.35); gl_FragColor=vec4(c,1.);}",
    depthWrite: false,
  });
  const nen = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), nenMat);
  nen.position.z = -20;
  nen.renderOrder = -1;
  scene.add(nen);

  const datMo = (obj: THREE.Object3D, o: number) => {
    obj.traverse((m: any) => {
      if (!m.material) return;
      for (const mt of Array.isArray(m.material) ? m.material : [m.material]) {
        if (mt.userData.goc === undefined) { mt.userData.goc = mt.opacity; mt.transparent = true; }
        mt.opacity = mt.userData.goc * o;
      }
    });
    obj.visible = o > 0.01;
  };

  const taoBong = () => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(43,43,42,.28)");
    gr.addColorStop(1, "rgba(43,43,42,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  const CAO = 2.55;
  const SP: Record<string, { g: THREE.Group; bong?: THREE.Mesh }> = {};
  const tai = new THREE.TextureLoader();
  const taoTuyp = (ten: string, url: string, tiLe: number) => {
    const g = new THREE.Group();
    const tex = tai.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(CAO * tiLe, CAO), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })));
    const bong = taoBong();
    bong.scale.set(CAO * tiLe * 1.5, 0.5, 1);
    bong.position.y = -CAO / 2 - 0.02;
    g.add(bong);
    scene.add(g);
    SP[ten] = { g, bong };
  };
  taoTuyp("srm", opts.taiSan.sua_rua_mat, 366 / 989);
  taoTuyp("kem", opts.taiSan.kem_duong, 368 / 980);

  // Ampoule 3D + nắp nhỏ giọt tháo được
  const ampG = new THREE.Group();
  scene.add(ampG);
  SP.amp = { g: ampG };
  const NAP: { nhom: THREE.Group | null; giot: THREE.Mesh | null; gon: THREE.Mesh | null } = { nhom: null, giot: null, gon: null };
  const longMat = () => new THREE.MeshPhysicalMaterial({ color: 0x86afe6, roughness: 0.15, clearcoat: 0.8, envMapIntensity: 1.1, transparent: true, opacity: 0.85, depthWrite: false });
  new GLTFLoader().load(
    opts.taiSan.ampoule_glb,
    (gltf) => {
      const m = gltf.scene;
      const than = new THREE.MeshPhysicalMaterial({ color: 0xe9f2ff, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6, transparent: true, opacity: 0.22, depthWrite: false });
      const long = new THREE.MeshPhysicalMaterial({ color: 0x86afe6, roughness: 0.18, clearcoat: 0.6, envMapIntensity: 0.9, transparent: true, opacity: 0.78, depthWrite: false });
      const chu = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5, transparent: true });
      m.traverse((o: any) => {
        if (!o.isMesh) return;
        o.material = o.name.includes("Body") ? than : o.name.includes("Liquid") ? long : chu;
        o.renderOrder = o.name.includes("Liquid") ? 1 : o.name.includes("Body") ? 2 : 3;
      });
      const nap = new THREE.Group();
      m.add(nap);
      const co = new THREE.Mesh(new THREE.CylinderGeometry(0.0128, 0.0135, 0.024, 48), new THREE.MeshPhysicalMaterial({ color: 0x9cc2f0, roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.85 }));
      co.position.y = 0.102;
      nap.add(co);
      const vien = new THREE.Mesh(new THREE.CylinderGeometry(0.0145, 0.0145, 0.004, 48), new THREE.MeshPhysicalMaterial({ color: 0xc4dbf7, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.7 }));
      vien.position.y = 0.091;
      nap.add(vien);
      const bop = new THREE.Mesh(new THREE.CapsuleGeometry(0.0075, 0.011, 8, 32), new THREE.MeshStandardMaterial({ color: 0xf1e8d4, roughness: 0.55, transparent: true }));
      bop.position.y = 0.126;
      nap.add(bop);
      const ong = new THREE.Mesh(new THREE.CylinderGeometry(0.0026, 0.0018, 0.066, 20), new THREE.MeshPhysicalMaterial({ color: 0xdbe9fb, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.45 }));
      ong.position.y = 0.057;
      nap.add(ong);
      const giot = new THREE.Mesh(new THREE.SphereGeometry(0.0042, 24, 16), longMat());
      m.add(giot);
      const gon = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: 0x5d8fd6, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
      gon.rotation.x = -Math.PI / 2;
      m.add(gon);
      m.scale.setScalar(CAO / 0.1335);
      m.position.y = -CAO / 2;
      ampG.add(m);
      const bong = taoBong();
      bong.scale.set(1.3, 0.5, 1);
      bong.position.y = -CAO / 2 - 0.02;
      ampG.add(bong);
      Object.assign(NAP, { nhom: nap, giot, gon });
      SP.amp.bong = bong;
      opts.onSanSang?.();
    },
    undefined,
    () => opts.onSanSang?.(),
  );

  // Hạt thành phần: biểu tượng 3D trừu tượng (W053 sẽ thay bằng ảnh thật / phân tử đúng cấu trúc)
  const vatLieu = (c: number) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.35, clearcoat: 0.6, envMapIntensity: 1.2 });
  const hat = (loai: LoaiHat) => {
    const g = new THREE.Group(), ben = new THREE.Group();
    g.add(ben);
    if (loai === "thua") {
      for (let i = 0; i < 9; i++) {
        const l = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.36, 10), vatLieu(0x7fae8a));
        const a = (i / 9) * Math.PI * 2;
        l.position.set(Math.cos(a) * 0.07, 0.06, Math.sin(a) * 0.07);
        l.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6);
        ben.add(l);
      }
      const l = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.42, 10), vatLieu(0x6c9d78));
      l.position.y = 0.12;
      ben.add(l);
    } else if (loai === "sen") {
      for (let r = 0; r < 2; r++)
        for (let i = 0; i < 8; i++) {
          const c = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), vatLieu(r ? 0xb7cdf2 : 0x8fb0e6));
          c.scale.set(0.05, 0.018, 0.15);
          const a = ((i + r * 0.5) / 8) * Math.PI * 2;
          c.position.set(Math.cos(a) * 0.11, -0.02 + r * 0.04, Math.sin(a) * 0.11);
          c.rotation.set(0, -a + Math.PI / 2, 0);
          c.rotateX(r ? -0.9 : -0.5);
          ben.add(c);
        }
      const nhuy = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), vatLieu(0xf1d27a));
      nhuy.position.y = 0.03;
      ben.add(nhuy);
    } else if (loai === "rau-ma") {
      for (let i = 0; i < 3; i++) {
        const d = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.012, 32), vatLieu(0x8fbf7f));
        const a = (i / 3) * Math.PI * 2;
        d.position.set(Math.cos(a) * 0.09, 0.04 * i - 0.04, Math.sin(a) * 0.09);
        d.rotation.set(0.9, a, 0.3);
        ben.add(d);
      }
    } else if (loai === "xoan") {
      for (let i = 0; i < 12; i++) {
        const t = i / 11, a = t * Math.PI * 3.2;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), vatLieu(i % 2 ? 0x9cc2f0 : 0xdbe9fb));
        b.position.set(Math.cos(a) * 0.09, (t - 0.5) * 0.36, Math.sin(a) * 0.09);
        ben.add(b);
      }
    } else {
      const mau = [0xffffff, 0xe8d2cc, 0xcfe3d5, 0xffffff, 0xe8d2cc, 0xcfe3d5];
      const dinh: [number, number, number][] = [[0, 0, 0], [0.15, 0.08, 0], [-0.13, 0.1, 0.04], [0.02, -0.15, 0.05], [0.2, -0.08, -0.06], [-0.2, -0.08, -0.05]];
      dinh.forEach((vv, i) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(i ? 0.045 : 0.06, 18, 14), vatLieu(mau[i]));
        b.position.set(...vv);
        ben.add(b);
        if (i) {
          const goc = new THREE.Vector3(...dinh[i < 4 ? 0 : 1]), ngon = new THREE.Vector3(...vv);
          const que = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, goc.distanceTo(ngon), 8), vatLieu(0xbfbfbf));
          que.position.copy(goc).lerp(ngon, 0.5);
          que.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ngon.clone().sub(goc).normalize());
          ben.add(que);
        }
      });
    }
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, clearcoat: 1, envMapIntensity: 2, iridescence: 0.8, transparent: true, opacity: 0.14, depthWrite: false })));
    g.userData.ben = ben;
    g.visible = false;
    scene.add(g);
    return g;
  };
  const TP_SRM = opts.hatSrm.map((l) => hat(l));
  const TP_AMP = opts.hatAmp.map((l) => {
    const g = hat(l);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0x2b2b2a, transparent: true, opacity: 0.25 }));
    line.visible = false;
    scene.add(line);
    return { g, line };
  });

  // Bọt khí
  const NB = 70;
  const bot = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, clearcoat: 1, envMapIntensity: 2.4, iridescence: 1, iridescenceIOR: 1.3, transparent: true, opacity: 0.5, depthWrite: false }), NB);
  bot.frustumCulled = false;
  bot.visible = false;
  scene.add(bot);
  const botDL = [...Array(NB)].map(() => ({ a: Math.random() * Math.PI * 2, r: 1.0 + Math.random() * 1.2, z: (Math.random() - 0.5) * 1.8, s: 0.04 + Math.pow(Math.random(), 2.2) * 0.2, d: Math.random(), w: Math.random() * 6 }));

  // "No.1" lớn sau ampoule (hook chính phần giải thưởng)
  const so1 = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
  so1.visible = false;
  scene.add(so1);
  const veSo1 = () => {
    const cv = document.createElement("canvas");
    cv.width = 1600;
    cv.height = 800;
    const g = cv.getContext("2d")!;
    g.font = 'italic 500 640px "Playfair Display", Georgia, serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    const gr = g.createLinearGradient(0, 120, 0, 720);
    gr.addColorStop(0, "#9dbbea");
    gr.addColorStop(1, "#5f86c6");
    g.shadowColor = "rgba(43,60,90,.18)";
    g.shadowBlur = 40;
    g.shadowOffsetY = 18;
    g.fillStyle = gr;
    g.fillText(opts.so1, 800, 420);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    (so1.material as THREE.MeshBasicMaterial).map = t;
    (so1.material as THREE.MeshBasicMaterial).needsUpdate = true;
  };
  document.fonts?.load('italic 500 100px "Playfair Display"').then(veSo1, veSo1);
  const GIOT = [...Array(14)].map((_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 3) * 0.025, 20, 14), longMat());
    m.visible = false;
    scene.add(m);
    return m;
  });

  // Dải kem
  const kemMat = new THREE.MeshPhysicalMaterial({ color: 0xf8f3ee, roughness: 0.38, clearcoat: 0.5, envMapIntensity: 1.1, transparent: true });
  let daiKem: THREE.Mesh | null = null;
  let nuaW = 1, nuaH = 1, dienThoai = false;
  const dungDaiKem = () => {
    if (daiKem) { scene.remove(daiKem); daiKem.geometry.dispose(); }
    const s = noiSuy(KHOA.kem, 0.8, dienThoai);
    const pos = new THREE.Vector3(s.x * nuaW, s.y * nuaH, s.z);
    const h = (CAO / 2) * s.s + 0.06;
    const huong = new THREE.Vector3(Math.sin(s.rz), -Math.cos(s.rz), 0);
    const mieng = pos.clone().addScaledVector(huong, h);
    const day = dienThoai ? -0.02 * nuaH : -0.58 * nuaH;
    const goc = new THREE.Vector3(mieng.x + (dienThoai ? 0.2 : 0.5), day, 0);
    const pts = [mieng.clone(), mieng.clone().addScaledVector(huong, 0.35), new THREE.Vector3((mieng.x + goc.x) / 2 + 0.25, (mieng.y + day) / 2, 0.1)];
    const R = dienThoai ? 0.38 : 0.6;
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, a = Math.PI / 2 - t * 2.6 * Math.PI * 2, r = R * (1 - t * 0.8);
      pts.push(new THREE.Vector3(goc.x + Math.cos(a) * r, day + 0.06 + t * R * 0.95, Math.sin(a) * r * 0.7));
    }
    daiKem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 600, dienThoai ? 0.06 : 0.085, 14), kemMat);
    daiKem.visible = false;
    scene.add(daiKem);
  };

  const doiCo = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    nuaH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    nuaW = nuaH * camera.aspect;
    dienThoai = w < 768;
    const sz = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z + 20) * 2;
    nen.scale.set(sz * camera.aspect * 1.05, sz * 1.05, 1);
    dungDaiKem();
  };
  doiCo();

  const v = new THREE.Vector3(), v2 = new THREE.Vector3(), mt = new THREE.Matrix4(), qt = new THREE.Quaternion(), sc = new THREE.Vector3(), tam = new THREE.Vector3();
  const chieu = (obj: THREE.Object3D, o: number): ViTriNhan => {
    tam.setFromMatrixPosition(obj.matrixWorld).project(camera);
    return { x: (tam.x * 0.5 + 0.5) * canvas.clientWidth, y: (-tam.y * 0.5 + 0.5) * canvas.clientHeight, o };
  };
  const mauNen = { a: new THREE.Color(), b: new THREE.Color() };

  const ve = (p: number, time: number) => {
    for (const k of ["srm", "amp", "kem"] as const) {
      const s = noiSuy(KHOA[k], p, dienThoai), g = SP[k].g;
      const tho = opts.giamChuyenDong ? 0 : Math.sin(time * 0.0011 + (k === "amp" ? 1 : k === "kem" ? 2 : 0)) * 0.035;
      g.position.set(s.x * nuaW, s.y * nuaH + tho, s.z);
      g.scale.setScalar(s.s);
      g.rotation.set(0, k === "amp" ? s.ry : kep(s.ry, -0.32, 0.32), s.rz);
      datMo(g, s.o);
      if (SP[k].bong) SP[k].bong!.visible = Math.abs(s.rz) < 0.35;
      g.updateMatrixWorld();
    }
    const srm = SP.srm.g, amp = SP.amp.g;

    // 1) Bọt khí
    const eB = seg(p, 0.07, 0.14), raB = seg(p, 0.152, 0.19);
    bot.visible = eB > 0 && raB < 1;
    if (bot.visible) {
      const nap = srm.localToWorld(new THREE.Vector3(0, -CAO / 2 + 0.12, 0));
      const k = dienThoai ? 0.55 : 1;
      botDL.forEach((b, i) => {
        const e = muot(kep(eB * 1.7 - b.d * 0.7));
        const dich = v2.set(srm.position.x + Math.cos(b.a) * b.r * k * (Math.cos(b.a) > 0 ? 0.75 : 1.15), srm.position.y + Math.sin(b.a) * b.r * k * 1.1 + raB * 3.2 * (0.6 + b.d), b.z);
        const lac = opts.giamChuyenDong ? 0 : Math.sin(time * 0.0012 + b.w) * 0.06;
        v.copy(nap).lerp(dich, e);
        v.x += lac;
        v.y += lac * 0.6;
        mt.compose(v, qt.identity(), sc.setScalar(Math.max(b.s * k * e * (1 - raB * 0.9), 1e-4)));
        bot.setMatrixAt(i, mt);
      });
      bot.instanceMatrix.needsUpdate = true;
      (bot.material as THREE.MeshPhysicalMaterial).opacity = 0.5 * (1 - raB);
    }

    // 2) Thành phần sữa rửa mặt: quỹ đạo
    const eQ = seg(p, 0.18, 0.215), raQ = seg(p, 0.262, 0.288);
    const nhanSrm = TP_SRM.map((g, i) => {
      const op = eQ * (1 - raQ);
      datMo(g, op);
      const goc = ((p - 0.185) / 0.085) * Math.PI * 1.1 + (i * Math.PI) / 2 + 0.4;
      const r = (dienThoai ? 1.05 : 1.95) * (0.3 + 0.7 * eQ) * (1 + raQ * 0.6);
      g.position.set(srm.position.x + Math.cos(goc) * r, srm.position.y + Math.sin(goc) * (dienThoai ? 0.55 : 0.75) - 0.05, Math.sin(goc) * 1.4);
      g.scale.setScalar((dienThoai ? 0.72 : 1.08) * (0.4 + 0.6 * eQ));
      g.userData.ben.rotation.y = time * 0.0006 + i;
      g.updateMatrixWorld();
      return chieu(g, op * (g.position.z > -0.5 ? 1 : 0.25));
    });

    // 4) Nắp nhỏ giọt
    if (NAP.nhom && NAP.giot && NAP.gon) {
      const nhac = seg(p, 0.43, 0.455) - seg(p, 0.5, 0.525), lech = seg(p, 0.452, 0.468) - seg(p, 0.495, 0.51);
      NAP.nhom.position.set(lech * 0.036, nhac * 0.075, 0);
      NAP.nhom.rotation.z = -lech * 0.12;
      const f = seg(p, 0.466, 0.492), tx = lech * 0.036, ty = 0.024 + nhac * 0.075;
      NAP.giot.visible = f > 0 && f < 1 && nhac > 0.5;
      if (NAP.giot.visible) {
        const taoGiot = kep(f / 0.3), roi = kep((f - 0.3) / 0.7);
        NAP.giot.scale.setScalar(0.3 + 0.7 * taoGiot);
        NAP.giot.position.set(tx, ty - 0.004 - roi * roi * (ty - 0.004), 0);
      }
      const gg = seg(p, 0.488, 0.508);
      NAP.gon.visible = gg > 0 && gg < 1;
      if (NAP.gon.visible) {
        NAP.gon.position.set(tx, 0.0006, 0);
        NAP.gon.scale.setScalar(0.002 + gg * 0.032);
        (NAP.gon.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - gg);
      }
    }

    // 5) Thành phần ampoule: cột có đường nối
    const nhanAmp = TP_AMP.map(({ g, line }, i) => {
      const e = seg(p, 0.532 + i * 0.012, 0.556 + i * 0.012) * (1 - seg(p, 0.612, 0.636));
      datMo(g, e);
      line.visible = e > 0.01;
      const tu = v.copy(amp.position);
      tu.y += 0.2 - i * 0.15;
      const den = dienThoai ? v2.set(0.45 * nuaW, nuaH * (0.66 - i * 0.2), 0) : v2.set(-0.02 * nuaW, nuaH * (0.06 - i * 0.22), 0);
      g.position.copy(tu).lerp(den, e);
      g.scale.setScalar((dienThoai ? 0.58 : 0.74) * (0.3 + 0.7 * e));
      g.userData.ben.rotation.y = time * 0.0007 + i * 1.3;
      g.updateMatrixWorld();
      const a = line.geometry.attributes.position as THREE.BufferAttribute;
      a.setXYZ(0, amp.position.x + 0.45, amp.position.y + 0.25 - i * 0.12, 0);
      a.setXYZ(1, g.position.x - 0.22 * e, g.position.y, 0);
      a.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity = 0.32 * e;
      return chieu(g, dienThoai ? 0 : e);
    });

    // 6) No.1 + vòng giọt
    const eN = seg(p, 0.645, 0.675) * (1 - seg(p, 0.712, 0.74));
    (so1.material as THREE.MeshBasicMaterial).opacity = eN;
    so1.visible = opts.hienSo1 !== false && eN > 0.01;
    so1.position.set(amp.position.x, amp.position.y + (dienThoai ? 0.35 : 0.75), -2.6);
    so1.scale.setScalar((dienThoai ? 0.5 : 1.15) * (0.7 + 0.3 * eN));
    GIOT.forEach((m, i) => {
      m.visible = eN > 0.01;
      if (!m.visible) return;
      const a = (i / GIOT.length) * Math.PI * 2 + (p - 0.645) * 14, r = (dienThoai ? 1.0 : 1.55) * (0.6 + 0.4 * eN);
      m.position.set(amp.position.x + Math.cos(a) * r, amp.position.y + Math.sin(a * 2) * 0.35 + 0.1, Math.sin(a) * r);
      (m.material as THREE.MeshPhysicalMaterial).opacity = 0.85 * eN;
    });

    // 7) Dải kem
    if (daiKem) {
      const e = seg(p, 0.785, 0.85), ra = seg(p, 0.868, 0.9);
      daiKem.visible = e > 0 && ra < 1;
      const n = daiKem.geometry.index!.count;
      daiKem.geometry.setDrawRange(0, Math.floor((n * e) / 6) * 6);
      kemMat.opacity = 1 - ra;
    }

    // màu nền theo chương
    const mau = p < 0.37 ? ["#F7EEEB", "#F3DED8"] : p < 0.72 ? ["#F4F7FB", "#D8E7F6"] : p < 0.87 ? ["#FBF7F3", "#EAF3ED"] : p < 0.95 ? ["#F7EEEB", "#EAF3ED"] : ["#FFFFFF", "#F4F1EE"];
    nenMat.uniforms.uA.value.lerp(mauNen.a.set(mau[0]), 0.06);
    nenMat.uniforms.uB.value.lerp(mauNen.b.set(mau[1]), 0.06);

    renderer.render(scene, camera);
    return { srm: nhanSrm, amp: nhanAmp };
  };

  const huy = () => {
    scene.traverse((o: any) => {
      o.geometry?.dispose?.();
      for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) { m.map?.dispose?.(); m.dispose?.(); }
    });
    pmrem.dispose();
    renderer.dispose();
  };

  return { ve, doiCo, huy };
}
