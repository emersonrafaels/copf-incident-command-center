import { COPFLayout } from "@/components/copf/COPFLayout";
import { Dashboard } from "@/components/copf/Dashboard";
import { Onboarding } from "@/components/copf/Onboarding";

const Index = () => {
  return (
    <COPFLayout>
      <Dashboard />
      <Onboarding />
    </COPFLayout>
  );
};

export default Index;
