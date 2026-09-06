import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AirlineGame from "@/components/airline-game";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AirlineGame />
  </StrictMode>,
);
