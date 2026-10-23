"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/discover", label: "Jelajahi" },
  { href: "/requests", label: "Permintaan" },
  { href: "/groups", label: "Kelompok" },
  { href: "/goals", label: "Tujuan" },
  { href: "/mentor", label: "Mentor" },
  { href: "/bookings", label: "Booking" },
  { href: "/profile", label: "Profil" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium no-underline transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-neutral-soft hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
