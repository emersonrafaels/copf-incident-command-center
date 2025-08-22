import { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FeatureToggleProvider } from "./contexts/FeatureToggleContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FeatureToggleProvider>
      <App />
    </FeatureToggleProvider>
  </StrictMode>
);
