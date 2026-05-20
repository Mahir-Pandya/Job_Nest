"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Find Job" },
  { href: "/companies", label: "Companies" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
      {links.map((link) => {
        // Strict exact match for Home, loose prefix match for others (e.g. /jobs/123)
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={cn(
              "relative py-1 transition-colors text-gray-600 hover:text-blue-600",
              isActive && "text-blue-600 font-semibold"
            )}
          >
            {link.label}
            {isActive && (
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-blue-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
