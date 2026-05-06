import { toast } from "sonner";

export function showGlobalToast(message: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("app:toast", {
      detail: { message },
    })
  );
}

type ToastConfirmOptions = {
  actionLabel?: string;
  cancelLabel?: string;
  duration?: number;
};

export function confirmWithToast(message: string, options: ToastConfirmOptions = {}): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const {
    actionLabel = "확인",
    cancelLabel = "취소",
    duration = 9000,
  } = options;

  return new Promise((resolve) => {
    let resolved = false;

    const settle = (value: boolean) => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(value);
    };

    toast(message, {
      duration,
      action: {
        label: actionLabel,
        onClick: () => settle(true),
      },
      cancel: {
        label: cancelLabel,
        onClick: () => settle(false),
      },
      onDismiss: () => settle(false),
    });
  });
}
