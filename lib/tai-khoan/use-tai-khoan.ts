"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { laySupabase } from "@/lib/supabase/client";
import { laDaDangNhap } from "./dang-nhap";

export interface TrangThaiTaiKhoan {
  /** Đã đọc xong session lần đầu. */
  daTai: boolean;
  daDangNhap: boolean;
  email: string | null;
}

function tuSession(session: Session | null): TrangThaiTaiKhoan {
  const user = session?.user;
  const daDangNhap = laDaDangNhap(user);
  return { daTai: true, daDangNhap, email: daDangNhap ? (user?.email ?? null) : null };
}

/** Theo dõi trạng thái đăng nhập email của khách (đọc session, nghe onAuthStateChange). */
export function useTaiKhoan(): TrangThaiTaiKhoan {
  const [trangThai, setTrangThai] = useState<TrangThaiTaiKhoan>({
    daTai: false,
    daDangNhap: false,
    email: null,
  });

  useEffect(() => {
    const supabase = laySupabase();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrangThai({ daTai: true, daDangNhap: false, email: null });
      return;
    }
    let conGan = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (conGan) setTrangThai(tuSession(data.session));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_suKien, session) => {
      if (conGan) setTrangThai(tuSession(session));
    });
    return () => {
      conGan = false;
      subscription.unsubscribe();
    };
  }, []);

  return trangThai;
}
