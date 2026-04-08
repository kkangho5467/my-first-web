import MainLayout from "./components/MainLayout";
import HomeDashboardGrid from "./components/HomeDashboardGrid";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <MainLayout>
      <HomeDashboardGrid />
    </MainLayout>
  );
}
