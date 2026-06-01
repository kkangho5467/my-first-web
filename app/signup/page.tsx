import MainLayout from "@/app/components/MainLayout";
import AuthForm from "@/app/components/AuthForm";

export default function SignupPage() {
  return (
    <MainLayout>
      <AuthForm initialMode="signup" showModeSwitch={false} />
    </MainLayout>
  );
}
