import trangChuJson from "@/lib/data/trang-chu.json";
import { TrangChuConfigSchema, type TrangChuConfig } from "./schema";

export * from "./schema";
export { dinhDangNgan, dinhDangGioV3 } from "./dinh-dang";

export const TRANG_CHU_CONFIG: TrangChuConfig =
  TrangChuConfigSchema.parse(trangChuJson);
