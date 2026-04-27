"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuthForm() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function normalizeUsername(rawUsername: string): string {
    return rawUsername.trim();
  }

  function buildPseudoEmail(rawUsername: string): string {
    // Supabase 이메일 인증 API를 아이디 기반 로그인처럼 쓰기 위한 내부 변환값.
    return `${rawUsername.trim()}@myboard.local.com`;
  }

  function toFriendlyErrorMessage(message: string): string {
    const normalized = message.toLowerCase();

    if (normalized.includes("unable to validate email address") && normalized.includes("invalid format")) {
      return "이메일 형식이 올바르지 않습니다.";
    }

    if (normalized.includes("invalid login credentials")) {
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    }

    if (normalized.includes("user already registered")) {
      return "이미 가입된 이메일입니다. 로그인해 주세요.";
    }

    if (normalized.includes("password should be at least")) {
      return "비밀번호는 최소 6자 이상이어야 합니다.";
    }

    if (normalized.includes("email rate limit exceeded") || normalized.includes("rate limit")) {
      return "요청이 너무 많아 잠시 제한되었습니다. 잠시 후 다시 시도하거나 로그인 버튼을 눌러 주세요.";
    }

    if (normalized.includes("email not confirmed")) {
      return "이메일 인증이 완료되지 않았습니다. 인증 메일을 확인해 주세요.";
    }

    if (normalized.includes("network") || normalized.includes("fetch")) {
      return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.";
    }

    return `인증 중 오류가 발생했습니다: ${message}`;
  }

  function toSafeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return toFriendlyErrorMessage(error.message);
    }

    return "인증 중 알 수 없는 오류가 발생했습니다.";
  }

  async function handleSignUp() {
    setErrorMessage("");

    const normalizedUsername = normalizeUsername(username);
    const normalizedNickname = nickname.trim();
    const trimmedPassword = password.trim();

    if (!normalizedUsername || !normalizedNickname || !trimmedPassword) {
      setErrorMessage("아이디, 닉네임, 비밀번호를 모두 입력해 주세요.");
      return;
    }

    if (!/^[A-Za-z0-9]{4,20}$/.test(normalizedUsername)) {
      alert("아이디는 4~20자의 영문과 숫자만 사용 가능합니다.");
      return;
    }

    if (!/^[가-힣A-Za-z0-9]{2,8}$/.test(normalizedNickname)) {
      alert("닉네임은 특수문자 없이 한글, 영문, 숫자만 가능하고 2자 이상 8자 이하여야 합니다.");
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(trimmedPassword)) {
      alert("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return;
    }

    const pseudoEmail = buildPseudoEmail(normalizedUsername);

    setIsSubmitting(true);

    try {
      // 이미 계정이 있으면 회원가입 대신 즉시 로그인 처리한다.
      const { error: existingSignInError } = await supabase.auth.signInWithPassword({
        email: pseudoEmail,
        password: trimmedPassword,
      });

      if (!existingSignInError) {
        alert("이미 가입된 계정으로 로그인되었습니다.");
        router.push("/");
        router.refresh();
        return;
      }

      if (!existingSignInError.message.toLowerCase().includes("invalid login credentials")) {
        setErrorMessage(toFriendlyErrorMessage(existingSignInError.message));
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: pseudoEmail,
        password: trimmedPassword,
        options: {
          data: {
            nickname: normalizedNickname,
          },
        },
      });

      if (error) {
        setErrorMessage(toFriendlyErrorMessage(error.message));
        return;
      }

      alert("회원가입이 완료되었습니다.");
      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(toSafeErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignIn() {
    setErrorMessage("");

    const normalizedUsername = normalizeUsername(username);
    const pseudoEmail = buildPseudoEmail(normalizedUsername);

    if (!normalizedUsername || !password.trim()) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: pseudoEmail,
        password: password.trim(),
      });

      if (error) {
        setErrorMessage(toFriendlyErrorMessage(error.message));
        return;
      }

      alert("로그인에 성공했습니다.");
      router.push("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(toSafeErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    // Enter 제출 포함: 모드에 맞는 인증 동작으로 분기한다.
    if (isLoginMode) {
      await handleSignIn();
      return;
    }

    await handleSignUp();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          {isLoginMode ? "로그인" : "회원가입"}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          {isLoginMode ? "아이디와 비밀번호로 로그인할 수 있습니다." : "아이디, 닉네임, 비밀번호로 회원가입할 수 있습니다."}
        </CardDescription>
      </CardHeader>

      <CardContent>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="auth-username" className="text-sm font-medium text-slate-700">아이디</label>
          <Input
            id="auth-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="아이디를 입력하세요"
            className="w-full"
          />
        </div>

        {!isLoginMode ? (
          <div className="space-y-1.5">
            <label htmlFor="auth-nickname" className="text-sm font-medium text-slate-700">
              닉네임
            </label>
            <Input
              id="auth-nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full"
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">
            비밀번호
          </label>
          <Input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <div className="flex gap-2">
          {isLoginMode ? (
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              로그인
            </Button>
          ) : (
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
            >
              회원가입
            </Button>
          )}
        </div>

        <div className="pt-1 text-center text-xs text-slate-500">
          {isLoginMode ? (
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLoginMode(false);
                setErrorMessage("");
              }}
            >
              아직 계정이 없으신가요? 회원가입
            </Button>
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLoginMode(true);
                setErrorMessage("");
              }}
            >
              이미 계정이 있으신가요? 로그인
            </Button>
          )}
        </div>
      </form>
      </CardContent>
    </Card>
  );
}
