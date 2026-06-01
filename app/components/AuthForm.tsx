"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { toFriendlyErrorMessage, toSafeErrorMessage } from "@/lib/error-message";
import { signInWithPassword, signUp } from "@/lib/auth";

type AuthFormProps = {
  initialMode?: "login" | "signup";
  showModeSwitch?: boolean;
};

export default function AuthForm({ initialMode = "login", showModeSwitch = true }: AuthFormProps) {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(initialMode === "login");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function normalizeUsername(rawUsername: string): string {
    return rawUsername.trim();
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
      toast.error("아이디는 4~20자의 영문과 숫자만 사용 가능합니다.");
      return;
    }

    if (!/^[가-힣A-Za-z0-9]{2,8}$/.test(normalizedNickname)) {
      toast.error("닉네임은 특수문자 없이 한글, 영문, 숫자만 가능하고 2자 이상 8자 이하여야 합니다.");
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(trimmedPassword)) {
      toast.error("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미 계정이 있으면 회원가입 대신 즉시 로그인 처리한다.
      const { error: existingSignInError } = await signInWithPassword({
        username: normalizedUsername,
        password: trimmedPassword,
      });

      if (!existingSignInError) {
        toast.success("이미 가입된 계정으로 로그인되었습니다.");
        router.push("/");
        router.refresh();
        return;
      }

      if (!existingSignInError.message.toLowerCase().includes("invalid login credentials")) {
        setErrorMessage(toFriendlyErrorMessage(existingSignInError.message));
        return;
      }

      const { error } = await signUp({
        username: normalizedUsername,
        nickname: normalizedNickname,
        password: trimmedPassword,
      });

      if (error) {
        setErrorMessage(toFriendlyErrorMessage(error.message));
        return;
      }

      toast.success("회원가입이 완료되었습니다.");
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
    if (!normalizedUsername || !password.trim()) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signInWithPassword({
        username: normalizedUsername,
        password: password.trim(),
      });

      if (error) {
        setErrorMessage(toFriendlyErrorMessage(error.message));
        return;
      }

      toast.success("로그인에 성공했습니다.");
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

        {showModeSwitch ? (
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
        ) : null}
      </form>
      </CardContent>
    </Card>
  );
}
