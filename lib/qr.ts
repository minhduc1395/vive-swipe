/**
 * Máy phát mã QR (QR Code Generator) thuần TypeScript
 * Không dùng thư viện ngoài, hỗ trợ SSR và Client.
 * Tạo chuỗi SVG hoặc ma trận điểm phục vụ hiển thị mã giữ hàng VIVE.
 */

// Bảng Galois Field GF(256) với đa thức nguyên thủy 0x11d (285)
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d;
    }
  }
  LOG_TABLE[0] = 0;
})();

function gfNhan(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

// Bậc đa thức sửa lỗi (Reed-Solomon generator polynomial)
function taoDaThucSuaLoi(soByteSuaLoi: number): Uint8Array {
  let g = new Uint8Array([1]);
  for (let i = 0; i < soByteSuaLoi; i++) {
    const factor = new Uint8Array([1, EXP_TABLE[i]]);
    const nextG = new Uint8Array(g.length + 1);
    for (let j = 0; j < g.length; j++) {
      nextG[j] ^= gfNhan(g[j], factor[0]);
      nextG[j + 1] ^= gfNhan(g[j], factor[1]);
    }
    g = nextG;
  }
  return g;
}

function tinhByteSuaLoi(duLieu: Uint8Array, soByteSuaLoi: number): Uint8Array {
  const g = taoDaThucSuaLoi(soByteSuaLoi);
  const phanDu = new Uint8Array(soByteSuaLoi);
  const buffer = new Uint8Array(duLieu.length + soByteSuaLoi);
  buffer.set(duLieu);

  for (let i = 0; i < duLieu.length; i++) {
    const heSo = buffer[i];
    if (heSo !== 0) {
      for (let j = 0; j < g.length; j++) {
        buffer[i + j] ^= gfNhan(g[j], heSo);
      }
    }
  }
  phanDu.set(buffer.subarray(duLieu.length));
  return phanDu;
}

// Bảng cấu hình QR Code Level M (Medium - 15% phục hồi)
// Version 1..5: Kích thước, Dung lượng dữ liệu, Số byte sửa lỗi
interface CauHinhQR {
  version: number;
  size: number;
  dataBytes: number;
  ecBytes: number;
  alignmentPatterns: number[];
}

const BANG_CAU_HINH: CauHinhQR[] = [
  { version: 1, size: 21, dataBytes: 16, ecBytes: 10, alignmentPatterns: [] },
  { version: 2, size: 25, dataBytes: 28, ecBytes: 16, alignmentPatterns: [6, 18] },
  { version: 3, size: 29, dataBytes: 44, ecBytes: 26, alignmentPatterns: [6, 22] },
  { version: 4, size: 33, dataBytes: 64, ecBytes: 36, alignmentPatterns: [6, 26] },
  { version: 5, size: 37, dataBytes: 86, ecBytes: 48, alignmentPatterns: [6, 30] },
];

export interface MaTranQR {
  kichThuoc: number;
  duLieu: boolean[][];
}

/**
 * Tạo ma trận boolean 2 chiều biểu diễn mã QR cho văn bản đầu vào.
 */
export function taoMaTranQR(noiDung: string): MaTranQR {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(noiDung);

  // Chọn version nhỏ nhất chứa đủ dữ liệu
  let cfg = BANG_CAU_HINH.find((c) => bytes.length + 2 <= c.dataBytes);
  if (!cfg) {
    cfg = BANG_CAU_HINH[BANG_CAU_HINH.length - 1];
  }

  // Bit buffer: Byte mode (0100) + Character Count (8 bits cho v1-9) + dữ liệu + terminator
  const bits: number[] = [];
  function dayBits(giaTri: number, soBit: number) {
    for (let i = soBit - 1; i >= 0; i--) {
      bits.push((giaTri >> i) & 1);
    }
  }

  // 0100: Byte Mode
  dayBits(4, 4);
  // Độ dài chuỗi
  dayBits(bytes.length, 8);
  // Payload
  for (const b of bytes) {
    dayBits(b, 8);
  }
  // Terminator 0000 (tối đa 4 bit hoặc cho tới khi đầy dung lượng)
  const maxBits = cfg.dataBytes * 8;
  const terminator = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < terminator; i++) bits.push(0);

  // Padding bit để đủ bội số 8
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Padding bytes: 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    dayBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Chuyển bit thành Uint8Array
  const dataCodewords = new Uint8Array(cfg.dataBytes);
  for (let i = 0; i < cfg.dataBytes; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    dataCodewords[i] = b;
  }

  // Tính byte sửa lỗi
  const ecCodewords = tinhByteSuaLoi(dataCodewords, cfg.ecBytes);

  // Gộp data + ec
  const toanBoCodewords = new Uint8Array(cfg.dataBytes + cfg.ecBytes);
  toanBoCodewords.set(dataCodewords);
  toanBoCodewords.set(ecCodewords, cfg.dataBytes);

  // Tạo lưới matrix
  const size = cfg.size;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  function datModule(r: number, c: number, val: boolean) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      reserved[r][c] = true;
    }
  }

  // 1. Finder patterns (7x7 tại 3 góc)
  function datFinder(startR: number, startC: number) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        datModule(startR + r, startC + c, isBorder || isCore);
      }
    }
    // Separator
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (
          r === -1 ||
          r === 7 ||
          c === -1 ||
          c === 7
        ) {
          datModule(startR + r, startC + c, false);
        }
      }
    }
  }

  datFinder(0, 0);
  datFinder(0, size - 7);
  datFinder(size - 7, 0);

  // 2. Alignment pattern nếu version >= 2
  if (cfg.alignmentPatterns.length > 0) {
    const coords = cfg.alignmentPatterns;
    for (const r of coords) {
      for (const c of coords) {
        // Bỏ qua nếu trùng 3 góc finder
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c > size - 9) ||
          (r > size - 9 && c < 8)
        ) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            datModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    datModule(6, i, i % 2 === 0);
    datModule(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  datModule(size - 8, 8, true);

  // 5. Format info placeholder (Level M = 00, Mask 0 = 000 => format bits 101010000010010)
  // Mask 0: (row + col) % 2 === 0
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 15; i++) {
    const b = formatBits[i] === 1;
    // Góc trên bên trái
    if (i <= 5) datModule(8, i, b);
    else if (i === 6) datModule(8, 7, b);
    else if (i === 7) datModule(8, 8, b);
    else if (i === 8) datModule(7, 8, b);
    else datModule(14 - i, 8, b);

    // Góc đối xứng
    if (i < 8) datModule(size - 1 - i, 8, b);
    else datModule(8, size - 15 + i, b);
  }

  // 6. Đặt các bit dữ liệu (đi theo cột đôi từ phải qua trái ziczac)
  const allBits: number[] = [];
  for (const byte of toanBoCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  const len = allBits.length;
  let diLen = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Bỏ qua timing column

    const hangBatDau = diLen ? size - 1 : 0;
    const hangKetThuc = diLen ? -1 : size;
    const buoc = diLen ? -1 : 1;

    for (let r = hangBatDau; r !== hangKetThuc; r += buoc) {
      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (!reserved[r][curCol]) {
          let val = false;
          if (bitIdx < len) {
            val = allBits[bitIdx] === 1;
            bitIdx++;
          }
          // Áp dụng Mask 0: (r + curCol) % 2 === 0
          if ((r + curCol) % 2 === 0) {
            val = !val;
          }
          matrix[r][curCol] = val;
        }
      }
    }
    diLen = !diLen;
  }

  return { kichThuoc: size, duLieu: matrix };
}

/**
 * Trả về chuỗi SVG hiển thị mã QR.
 */
export function taoMaQrSvg(
  noiDung: string,
  tuyChon?: { kichThuoc?: number; vien?: number; mauTo?: string }
): string {
  const { kichThuoc = 180, vien = 2, mauTo = "#2B2B2A" } = tuyChon || {};
  const { kichThuoc: qSize, duLieu } = taoMaTranQR(noiDung);
  const tongSize = qSize + vien * 2;

  let pathD = "";
  for (let r = 0; r < qSize; r++) {
    for (let c = 0; c < qSize; c++) {
      if (duLieu[r][c]) {
        const x = c + vien;
        const y = r + vien;
        pathD += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tongSize} ${tongSize}" width="${kichThuoc}" height="${kichThuoc}" shape-rendering="crispEdges" aria-label="Mã QR cho ${noiDung}"><rect width="${tongSize}" height="${tongSize}" fill="#FFFFFF"/><path d="${pathD.trim()}" fill="${mauTo}"/></svg>`;
}
