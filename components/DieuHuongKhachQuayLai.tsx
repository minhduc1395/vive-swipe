"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { daTungKhaoSat } from "@/lib/khao-sat";

function DieuHuongInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("chao") === "1") return;
    if (daTungKhaoSat()) {
      router.replace("/quet");
    }
  }, [router, searchParams]);

  return null;
}

export function DieuHuongKhachQuayLai() {
  return (
    <Suspense fallback={null}>
      <DieuHuongInner />
    </Suspense>
  );
}
