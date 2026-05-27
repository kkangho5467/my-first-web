"use client";

import React from "react";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <section className="mx-auto w-full max-w-3xl p-6">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-700">문제가 발생했습니다</h1>
        <p className="mt-2 text-sm text-red-600">잠시 후 다시 시도해 주세요.</p>
        <details className="mt-3 text-xs text-red-700">
          <summary className="cursor-pointer">개발자용 오류(확인하려면 클릭)</summary>
          <pre className="mt-2 whitespace-pre-wrap">{String(error?.message ?? error)}</pre>
        </details>
        <div className="mt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            다시 시도
          </button>
        </div>
      </div>
    </section>
  );
}
