import React from "react";
import ReactDOM from "react-dom/client";

import "@/i18n";
import App from "./App";
import "./App.css";
import { ThemeProvider } from "@/shared/components/theme-provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
