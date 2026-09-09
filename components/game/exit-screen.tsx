"use client";

import type { CSSProperties } from "react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function ExitScreen({ onReturn }: { onReturn: () => void }) {
  return (
    <main
      className="exit-screen"
      style={
        {
          "--opening-background": `url('${PUBLIC_BASE_PATH}/opening-airport-dusk.png')`,
        } as CSSProperties
      }
    >
      <Brand />

      <div>
        <span>SESSION PAUSED</span>
        <h1>Thank you for playing.</h1>
        <p>
          Your progress is safe. You can close this tab or return to the main
          menu.
        </p>
        <Button className="gold-button" onClick={onReturn}>
          Return to main menu
        </Button>
      </div>
    </main>
  );
}
