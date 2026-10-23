"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import {
  CanvasTexture,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Brand colors, as used by the design tokens (a canvas texture and WebGL
// lights cannot read CSS variables).
const GRAPHITE_TOP = "#253041";
const GRAPHITE_BOTTOM = "#141b27";
const INK = "#f9fafb"; // --text-inverse
const LIME = 0xa3e635; // --color-accent

// Calm on purpose: about one turn every 28 seconds, with a slow sway.
const SPIN_RADIANS_PER_SECOND = 0.22;
const SWAY_AMPLITUDE = 0.08;
const SWAY_SPEED = 0.35;

// Imported only through next/dynamic (see orbyte-cube.tsx): three.js stays
// out of every other bundle.
export default function CubeScene({ onFailure }: { onFailure: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fail = useEffectEvent(onFailure);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true, // the band's own background shows through
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
    } catch {
      fail();
      return;
    }
    // Retina-sharp, but never more than 2x the pixels.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    host.appendChild(canvas);

    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6.6);

    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const texture = createFaceTexture(anisotropy, "face");
    // The O alone, as an emissive mask: it stays crisp white whatever the
    // lighting, while the graphite around it takes the light.
    const glow = createFaceTexture(anisotropy, "mask");
    const geometry = new RoundedBoxGeometry(2, 2, 2, 6, 0.16);
    // Satin graphite: soft highlights, no mirror effect.
    const material = new MeshStandardMaterial({
      map: texture,
      emissive: 0xffffff,
      emissiveMap: glow,
      emissiveIntensity: 0.75,
      roughness: 0.5,
      metalness: 0.2,
    });
    const cube = new Mesh(geometry, material);
    cube.rotation.set(0.42, 0.65, 0);
    scene.add(cube);

    // Soft ambient (cool sky, graphite ground), a white key light, and a
    // faint lime rim from behind: the only touch of color.
    scene.add(new HemisphereLight(INK, GRAPHITE_BOTTOM, 1.6));
    const key = new DirectionalLight(0xffffff, 2.6);
    key.position.set(-3, 4, 5);
    scene.add(key);
    const rim = new DirectionalLight(LIME, 0.9);
    rim.position.set(4, -1.5, -4);
    scene.add(rim);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    // The render loop runs only while the band is on screen.
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      // Frame-rate independent; a long gap (tab switch) does not jump.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      cube.rotation.y += SPIN_RADIANS_PER_SECOND * dt;
      cube.rotation.x = 0.42 + Math.sin((now / 1000) * SWAY_SPEED) * SWAY_AMPLITUDE;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
      host.dataset.cubeState = "running";
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      host.dataset.cubeState = "paused";
    };
    const visibility = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    visibility.observe(host);

    // GPU reset or driver trouble: fall back to the still image.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
      fail();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      // Before forcing the loss below, which would otherwise report a failure.
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      glow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} data-cube-state="idle" className="absolute inset-0" />;
}

// One face, drawn at runtime (no image to download). "face": graphite with
// a gentle vertical gradient, a hairline inset frame and the white "O".
// "mask": the same "O" in white on black, for the emissive map.
function createFaceTexture(anisotropy: number, kind: "face" | "mask"): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  if (kind === "face") {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, GRAPHITE_TOP);
    gradient.addColorStop(1, GRAPHITE_BOTTOM);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(249, 250, 251, 0.08)";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, size - 80, size - 80);
  } else {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, size, size);
  }

  // A bold serif O, like the one in the supplied mark; centered on its ink.
  ctx.fillStyle = INK;
  ctx.font = '700 320px Georgia, "Times New Roman", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText("O");
  const y = size / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
  ctx.fillText("O", size / 2, y);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
}
