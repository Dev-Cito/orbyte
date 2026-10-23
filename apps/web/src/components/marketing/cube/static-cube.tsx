import Image from "next/image";
import logoMark from "../../../../public/O logo.png";

// The still version of the cube: the supplied "O" mark (a cube drawn in
// perspective). Shown with reduced motion, without WebGL, and on small
// screens. Decorative.
export function StaticCube({ className }: { className?: string }) {
  return (
    <Image
      src={logoMark}
      alt=""
      aria-hidden="true"
      sizes="(min-width: 768px) 200px, 96px"
      className={className}
    />
  );
}
