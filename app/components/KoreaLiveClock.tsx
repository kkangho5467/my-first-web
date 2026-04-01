"use client";

import { useEffect, useMemo, useState } from "react";

type KoreaLiveClockProps = {
  initialServerTime: string;
};

function formatKoreaTime(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export default function KoreaLiveClock({ initialServerTime }: KoreaLiveClockProps) {
  const [time, setTime] = useState(initialServerTime);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(formatKoreaTime());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const label = useMemo(() => `현재 시각(대한민국): ${time}`, [time]);

  return <p className="mt-4 text-sm text-slate-400">{label}</p>;
}
