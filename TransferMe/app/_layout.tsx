import { Stack } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { TransferPlanProvider } from '@/src/context/transfer-plan-context';
import '@/global.css';

export default function RootLayout() {
  return (
    <GluestackUIProvider>
      <TransferPlanProvider>
        <Stack initialRouteName="index" />
      </TransferPlanProvider>
    </GluestackUIProvider>
  );
}
