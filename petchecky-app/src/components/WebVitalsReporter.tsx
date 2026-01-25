"use client";

import { useEffect } from "react";
import { initWebVitals } from "@/lib/webVitals";

/**
 * Web Vitals Reporter Component
 *
 * 페이지 로드 시 Web Vitals 측정을 초기화합니다.
 */
export default function WebVitalsReporter() {
  useEffect(() => {
    // Web Vitals 측정 초기화
    initWebVitals();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다
  return null;
}
