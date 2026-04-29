"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUserStore } from "@/store/useUserStore";

type UserProfile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
};

export default function MyProfile() {
  const cropAreaSize = 192;
  const minAvatarZoom = 0.5;
  const maxAvatarZoom = 3;
  const [userId, setUserId] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageMeta, setSelectedImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarOffsetX, setAvatarOffsetX] = useState(0);
  const [avatarOffsetY, setAvatarOffsetY] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const email = useUserStore((state) => state.email);
  const nickname = useUserStore((state) => state.nickname);
  const avatarUrl = useUserStore((state) => state.avatarUrl);
  const setEmail = useUserStore((state) => state.setEmail);
  const setNickname = useUserStore((state) => state.setNickname);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);
  const clearUser = useUserStore((state) => state.clearUser);

  const avatarBucket = "avatars";

  useEffect(() => {
    let isMounted = true;

    async function loadMyProfile() {
      // 인증 유저/프로필 정보를 한 번에 로드해 편집 폼의 초기값을 만든다.
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError || !userData.user) {
        clearUser();
        router.replace("/auth?notice=login-required");
        setIsLoadingProfile(false);
        return;
      }

      setUserId(userData.user.id);
      setEmail(userData.user.email ?? "");
      setJoinedAt(
        userData.user.created_at
          ? new Date(userData.user.created_at).toLocaleDateString("ko-KR")
          : "-"
      );

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (profileError) {
        alert(profileError.message);
      }

      const existingProfile = profileData as UserProfile | null;
      if (existingProfile?.nickname) {
        setNicknameInput(existingProfile.nickname);
        setNickname(existingProfile.nickname);
      } else {
        setNickname("");
      }

      setAvatarUrl(existingProfile?.avatar_url || "");

      setIsLoadingProfile(false);
    }

    void loadMyProfile();

    return () => {
      isMounted = false;
    };
  }, [clearUser, router, setAvatarUrl, setEmail, setNickname]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleClickAvatar() {
    fileInputRef.current?.click();
  }

  function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setPreviewUrl(nextPreviewUrl);
    setAvatarZoom(1);
    setAvatarOffsetX(0);
    setAvatarOffsetY(0);

    const image = new window.Image();
    image.onload = () => {
      setSelectedImageMeta({ width: image.width, height: image.height });
    };
    image.src = nextPreviewUrl;
  }

  function handleCancelEdit() {
    setNicknameInput(nickname);
    setIsEditing(false);
  }

  async function makeProcessedAvatarFile(file: File): Promise<File> {
    const tempUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("이미지 로드에 실패했습니다."));
        img.src = tempUrl;
      });

      const outputSize = 512;
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("이미지 처리 컨텍스트를 생성하지 못했습니다.");
      }

      const baseScale = Math.max(outputSize / image.width, outputSize / image.height);
      const renderWidth = image.width * baseScale * avatarZoom;
      const renderHeight = image.height * baseScale * avatarZoom;
      const maxPanX = Math.max((renderWidth - outputSize) / 2, 0);
      const maxPanY = Math.max((renderHeight - outputSize) / 2, 0);
      // 슬라이더 값(zoom/offset)을 실제 캔버스 좌표로 변환해 잘라낸다.
      const drawX = (outputSize - renderWidth) / 2 + (avatarOffsetX / 100) * maxPanX;
      const drawY = (outputSize - renderHeight) / 2 + (avatarOffsetY / 100) * maxPanY;

      ctx.clearRect(0, 0, outputSize, outputSize);
      ctx.drawImage(image, drawX, drawY, renderWidth, renderHeight);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
            return;
          }
          reject(new Error("이미지 변환에 실패했습니다."));
        }, "image/jpeg", 0.92);
      });

      return new File([blob], `avatar-${Date.now()}.jpg`, { type: "image/jpeg" });
    } finally {
      URL.revokeObjectURL(tempUrl);
    }
  }

  async function uploadAvatarAndGetPublicUrl(currentUserId: string): Promise<string | null> {
    if (!selectedImageFile) {
      return null;
    }

    let fileForUpload = selectedImageFile;

    try {
      fileForUpload = await makeProcessedAvatarFile(selectedImageFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : "이미지 처리 중 오류가 발생했습니다.";
      alert(message);
      return null;
    }

    // 유저별 경로로 업로드하고 공개 URL을 프로필에 저장한다.
    const extension = fileForUpload.name.split(".").pop() || "jpg";
    const filePath = `${currentUserId}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(avatarBucket)
      .upload(filePath, fileForUpload, {
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      alert(`이미지 업로드 실패: ${uploadError.message}`);
      return null;
    }

    const { data: publicData } = supabase.storage.from(avatarBucket).getPublicUrl(filePath);
    return publicData.publicUrl;
  }

  async function handleSaveAvatarOnly() {
    if (!userId) {
      alert("로그인한 유저 정보를 찾을 수 없습니다.");
      return;
    }

    if (!selectedImageFile) {
      alert("저장할 이미지를 먼저 선택해 주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const nextAvatarUrl = await uploadAvatarAndGetPublicUrl(userId);
      if (!nextAvatarUrl) {
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        avatar_url: nextAvatarUrl,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setAvatarUrl(nextAvatarUrl);
      setSelectedImageFile(null);
      setSelectedImageMeta(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setAvatarZoom(1);
      setAvatarOffsetX(0);
      setAvatarOffsetY(0);
      alert("프로필 이미지가 업데이트되었습니다!");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveProfile() {
    if (!userId) {
      alert("로그인한 유저 정보를 찾을 수 없습니다.");
      return;
    }

    if (!nicknameInput.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    setIsSaving(true);

    try {
      let nextAvatarUrl = avatarUrl;

      if (selectedImageFile) {
        const uploadedUrl = await uploadAvatarAndGetPublicUrl(userId);
        if (!uploadedUrl) {
          return;
        }
        nextAvatarUrl = uploadedUrl;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        nickname: nicknameInput.trim(),
        avatar_url: nextAvatarUrl,
      });

      if (error) {
        alert(error.message);
        return;
      }

      setNickname(nicknameInput.trim());
      setAvatarUrl(nextAvatarUrl);
      setSelectedImageFile(null);
      setSelectedImageMeta(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setAvatarZoom(1);
      setAvatarOffsetX(0);
      setAvatarOffsetY(0);
      setIsEditing(false);
      alert("프로필이 업데이트되었습니다!");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingProfile) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="mx-auto h-24 w-24 rounded-full bg-slate-200" />
            <div className="mx-auto mt-3 h-4 w-28 rounded bg-slate-200" />
            <div className="mt-8 space-y-3">
              <div className="h-12 rounded-lg bg-slate-200" />
              <div className="h-12 rounded-lg bg-slate-200" />
              <div className="h-12 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const avatarSource = previewUrl || avatarUrl || "/profile-placeholder.svg";
  const hasCropTarget = Boolean(selectedImageFile && previewUrl && selectedImageMeta);

  const cropPreviewStyle = (() => {
    if (!selectedImageMeta) {
      return undefined;
    }

    const baseScale = Math.max(cropAreaSize / selectedImageMeta.width, cropAreaSize / selectedImageMeta.height);
    const renderWidth = selectedImageMeta.width * baseScale * avatarZoom;
    const renderHeight = selectedImageMeta.height * baseScale * avatarZoom;
    const maxPanX = Math.max((renderWidth - cropAreaSize) / 2, 0);
    const maxPanY = Math.max((renderHeight - cropAreaSize) / 2, 0);

    return {
      width: `${renderWidth}px`,
      height: `${renderHeight}px`,
      left: `${(cropAreaSize - renderWidth) / 2 + (avatarOffsetX / 100) * maxPanX}px`,
      top: `${(cropAreaSize - renderHeight) / 2 + (avatarOffsetY / 100) * maxPanY}px`,
    };
  })();

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">내 프로필 설정</h1>

        <div className="mt-6 flex flex-col items-center">
          {hasCropTarget ? (
            <div
              className="relative overflow-hidden rounded-full border border-slate-200 bg-slate-100"
              style={{ width: `${cropAreaSize}px`, height: `${cropAreaSize}px` }}
            >
              {previewUrl && cropPreviewStyle && selectedImageMeta ? (
                <Image
                  src={previewUrl}
                  alt="프로필 이미지 미리보기"
                  width={selectedImageMeta.width}
                  height={selectedImageMeta.height}
                  className="pointer-events-none absolute max-w-none select-none"
                  style={cropPreviewStyle}
                  unoptimized
                />
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClickAvatar}
              className="relative h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
              aria-label="프로필 이미지 선택"
            >
              <Image
                src={avatarSource}
                alt="프로필 이미지"
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickImage}
          />

          <button
            type="button"
            onClick={handleClickAvatar}
            className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            이미지 변경
          </button>

          {hasCropTarget ? (
            <div className="mt-4 w-full max-w-sm space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <label htmlFor="avatar-zoom" className="text-xs font-medium text-slate-600">
                  확대/축소 ({avatarZoom.toFixed(2)}x)
                </label>
                <input
                  id="avatar-zoom"
                  type="range"
                  min={String(minAvatarZoom)}
                  max={String(maxAvatarZoom)}
                  step="0.01"
                  value={avatarZoom}
                  onChange={(event) => setAvatarZoom(parseFloat(event.target.value))}
                  className="mt-1 w-full"
                />
              </div>

              <div>
                <label htmlFor="avatar-offset-x" className="text-xs font-medium text-slate-600">
                  좌우 위치
                </label>
                <input
                  id="avatar-offset-x"
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={avatarOffsetX}
                  onChange={(event) => setAvatarOffsetX(parseInt(event.target.value, 10))}
                  className="mt-1 w-full"
                />
              </div>

              <div>
                <label htmlFor="avatar-offset-y" className="text-xs font-medium text-slate-600">
                  상하 위치
                </label>
                <input
                  id="avatar-offset-y"
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={avatarOffsetY}
                  onChange={(event) => setAvatarOffsetY(parseInt(event.target.value, 10))}
                  className="mt-1 w-full"
                />
              </div>
            </div>
          ) : null}

          {selectedImageFile ? (
            <button
              type="button"
              onClick={handleSaveAvatarOnly}
              disabled={isSaving || !userId}
              className="mt-2 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          ) : null}
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">이메일</p>
            <p className="mt-1 text-sm text-slate-800">{email || "-"}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">닉네임</p>
            {!isEditing ? (
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-800">{nickname || "설정되지 않음"}</p>
                <button
                  type="button"
                  onClick={() => {
                    setNicknameInput(nickname);
                    setIsEditing(true);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  수정
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <input
                  id="my-profile-nickname"
                  type="text"
                  value={nicknameInput}
                  onChange={(event) => setNicknameInput(event.target.value)}
                  placeholder="닉네임을 입력하세요"
                  disabled={isSaving || !userId}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-300 transition focus:ring disabled:cursor-not-allowed disabled:bg-slate-100"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving || !userId}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">가입일</p>
            <p className="mt-1 text-sm text-slate-800">{joinedAt || "-"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}