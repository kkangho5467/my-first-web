export function toFriendlyErrorMessage(raw: unknown): string {
  let msg = "";

  if (typeof raw === "string") {
    msg = raw;
  } else if (raw && typeof raw === "object") {
    // try common shapes { message } or Supabase error object
    const candidate = raw as Record<string, unknown>;
    if (typeof candidate.message === "string") {
      msg = candidate.message;
    } else {
      msg = String(raw);
    }
  } else {
    msg = String(raw);
  }

  const norm = msg.toLowerCase();

  if (norm.includes("42501") || norm.includes("row-level security") || norm.includes("row level security") || norm.includes("permission")) {
    return "이 작업을 수행할 권한이 없습니다.";
  }

  if (norm.includes("failed to fetch") || norm.includes("networkerror") || norm.includes("network error") || norm.includes("network")) {
    return "인터넷 연결을 확인해주세요.";
  }

  if (norm.includes("not found") || norm.includes("not exist") || norm.includes("no such") || norm.includes("could not find")) {
    return "요청한 게시글을 찾을 수 없습니다.";
  }

  return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export function toSafeErrorMessage(err: unknown): string {
  // Keep original error for developers
  try {
    console.error("Captured error:", err);
  } catch {
    // ignore
  }

  return toFriendlyErrorMessage(err);
}

export default toFriendlyErrorMessage;