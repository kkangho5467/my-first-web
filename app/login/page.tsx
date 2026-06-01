import MainLayout from "@/app/components/MainLayout";
import AuthForm from "@/app/components/AuthForm";

export default function LoginPage() {
  return (
    <MainLayout>
      <AuthForm initialMode="login" showModeSwitch={false} />
    </MainLayout>
  );
}
