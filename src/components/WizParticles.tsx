import { useEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import { useColorScheme, useTheme, type CssVarsTheme } from "@mui/material/styles";
import { createWizScene, type WizPalette, type WizScene } from "./wizScene";

export default function WizParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<WizScene | null>(null);
  const theme = useTheme<CssVarsTheme>();
  const { colorScheme } = useColorScheme();

  const palette = useMemo<WizPalette>(() => {
    const scheme = colorScheme ?? "light";
    const colors = theme.colorSchemes[scheme]?.palette ?? theme.palette;
    return { primary: colors.primary.main, secondary: colors.secondary.main, dark: scheme === "dark" };
  }, [colorScheme, theme]);

  const paletteRef = useRef(palette);
  useEffect(() => {
    paletteRef.current = palette;
    sceneRef.current?.setPalette(palette);
  }, [palette]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let introPlayed = false;
    let lastWidth = 0;
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

    const build = (width: number) => {
      sceneRef.current?.dispose();
      sceneRef.current = createWizScene(canvas, {
        width,
        palette: paletteRef.current,
        playIntro: !introPlayed && !reducedMotion,
        reducedMotion,
      });
      introPlayed = true;
    };

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (!width || width === lastWidth) return;
      const first = lastWidth === 0;
      lastWidth = width;
      clearTimeout(resizeTimeout);
      if (first) build(width);
      else resizeTimeout = setTimeout(() => build(width), 200);
    });

    // Glyphs are sampled from the rendered font, so wait for Inter before laying out.
    document.fonts.load('800 100px "Inter"').finally(() => {
      if (!disposed) observer.observe(container);
    });

    return () => {
      disposed = true;
      clearTimeout(resizeTimeout);
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <Box ref={containerRef} sx={{ width: "100%" }}>
      <canvas
        ref={canvasRef}
        width={0}
        height={0}
        aria-hidden="true"
        style={{ display: "block", width: "100%", touchAction: "pan-y" }}
      />
    </Box>
  );
}
