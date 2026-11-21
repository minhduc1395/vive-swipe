import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { chonNgonNgu, COOKIE_NGON_NGU } from "./ngon-ngu";
import { layTuDien } from "./tu-dien";

export default getRequestConfig(async () => {
  const kho = await cookies();
  const dau = await headers();
  const locale = chonNgonNgu(kho.get(COOKIE_NGON_NGU)?.value, dau.get("accept-language"));
  return {
    locale,
    messages: await layTuDien(locale),
    timeZone: "Asia/Ho_Chi_Minh",
    // Khóa chưa dịch: không làm hỏng trang, hiện đường dẫn khóa để dễ thấy khi kiểm
    onError: () => {},
  };
});
