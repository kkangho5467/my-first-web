export function toFriendlyErrorMessage(raw: unknown): string {
  if (raw instanceof Error) {
    const msg = raw.message.toLowerCase();

    if (msg.includes("network") || msg.includes("failed to fetch") || msg.includes("fetch") ) {
      return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
    }

    if (msg.includes("not found") || msg.includes("no rows")) {
      return "요청한 항목을 찾을 수 없습니다.";
    }

    if (msg.includes("permission") || msg.includes("forbidden") || msg.includes("permission denied") || msg.includes("42501")) {
      return "해당 작업을 수행할 권한이 없습니다.";
    }

    // Supabase common messages
    if (msg.includes("invalid login credentials") || msg.includes("invalid password")) {
      return "아이디 또는 비밀번호가 올바르지 않습니다.";
    }

    return raw.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

export function toSafeErrorMessage(error: unknown): string {
  try {
    return toFriendlyErrorMessage(error);
  } catch {
    return "요청을 처리하는 중 오류가 발생했습니다.";
  }
}
