"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AdminBreadcrumb() {
  const pathname = usePathname(); // contoh: "/admin/dashboard/accounts"
  const parts = pathname.split("/").filter(Boolean); // ["admin", "dashboard", "accounts"]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parts.map((part, index) => {
          const href = "/" + parts.slice(0, index + 1).join("/");
          const isLast = index === parts.length - 1;
          return (
            <BreadcrumbItem key={href}>
              {isLast ? (
                <BreadcrumbPage>{part}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink href={href}>{part}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
