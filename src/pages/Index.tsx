import { COPFLayout } from "@/components/copf/COPFLayout";
import { Dashboard } from "@/components/copf/Dashboard";
import { SpotlightOnboarding } from "@/components/copf/SpotlightOnboarding";

const Index = () => {
  return (
    <COPFLayout>
      <Dashboard />
      <SpotlightOnboarding />
    </COPFLayout>
  );
};

export default Index;
