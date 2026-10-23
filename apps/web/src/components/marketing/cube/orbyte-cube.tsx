"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { StaticCube } from "./static-cube";

// three.js lives in this chunk only: requested once the CTA band nears the
// viewport, never by other pages, never during server rendering.
const CubeScene = dynamic(() => import("./cube-scene"), { ssr: false });

// Decorative 3D "O" cube for the landing's CTA band. Decides between the
// live scene and a still image:
// - prefers-reduced-motion: still image, three.js is not even downloaded;
// - no WebGL (old browser, blocked GPU) or a lost context: still image;
// - small screens (< 768px): still image, the 3D is not worth the battery;
// - otherwise: the scene, loaded when the band is about to be seen.
export function OrbyteCube({ className }: { className?: string }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const wide = useMediaQuery("(min-width: 768px)");
  const webgl = useSyncExternalStore(noSubscription, supportsWebGL, () => null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  // null: not known yet (server render, hydration): leave the space empty.
  const decided = reducedMotion !== null && wide !== null && webgl !== null;
  const live = decided && !reducedMotion && wide && webgl && !failed;

  useEffect(() => {
    const host = hostRef.current;
    if (!live || !host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [live]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-cube-mode={!decided ? "pending" : live ? "3d" : "static"}
      className={cn("relative", className)}
    >
      {/* Soft lime halo and ground shadow: CSS, not GPU work. */}
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-accent)_9%,transparent),transparent)]" />
      {decided && !live && (
        <div className="absolute inset-0 flex items-center justify-center">
          <StaticCube className="h-auto w-[62%] opacity-90" />
        </div>
      )}
      {live && near && <CubeScene onFailure={() => setFailed(true)} />}
    </div>
  );
}

function useMediaQuery(query: string): boolean | null {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => null,
  );
}

const noSubscription = () => () => {};

// Probed once per page: a throwaway canvas, its context released at once.
let webglSupport: boolean | undefined;
function supportsWebGL(): boolean {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      webglSupport = gl !== null;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
