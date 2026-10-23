import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
// The brand files supplied in public/ (black on transparent: made for light
// backgrounds). Static imports give next/image their dimensions, and it
// serves resized, compressed copies rather than the full-size PNGs.
import logoMark from "../../../public/O logo.png";
import wordmark from "../../../public/Orbyte logo.png";

const WORDMARK_RATIO = wordmark.width / wordmark.height;
const MARK_RATIO = logoMark.width / logoMark.height;

// The full "Orbyte" wordmark, where there is room (top bars, auth, footer).
// tone="dark" inverts the monochrome wordmark to white: no light version
// of the logo was supplied.
export function Logo({
  height = 32,
  tone = "light",
  href = "/",
  className,
}: {
  height?: number;
  tone?: "light" | "dark";
  // null: the image alone, not a link (e.g. inside a decorative mock).
  href?: string | null;
  className?: string;
}) {
  const image = (
    <Image
      src={wordmark}
      alt="Orbyte"
      height={height}
      width={Math.round(height * WORDMARK_RATIO)}
      priority
      className={cn(tone === "dark" && "invert")}
    />
  );
  return href === null ? (
    <span className={cn("inline-flex shrink-0 items-center", className)}>{image}</span>
  ) : (
    <Link href={href} className={cn("inline-flex shrink-0 items-center", className)}>
      {image}
    </Link>
  );
}

// The "O" mark alone, for tight spots (small screens, favicon-size uses).
export function LogoMark({
  size = 28,
  href,
  className,
}: {
  size?: number;
  href?: string;
  className?: string;
}) {
  const image = (
    <Image
      src={logoMark}
      alt="Orbyte"
      height={size}
      width={Math.round(size * MARK_RATIO)}
      priority
    />
  );
  return href ? (
    <Link href={href} className={cn("inline-flex shrink-0 items-center", className)}>
      {image}
    </Link>
  ) : (
    <span className={cn("inline-flex shrink-0 items-center", className)}>{image}</span>
  );
}
