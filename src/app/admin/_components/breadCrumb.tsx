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
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  const breadcrumbElements: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const isLast = index === parts.length - 1;

    breadcrumbElements.push(
      <BreadcrumbItem key={href}>
        {isLast ? (
          <BreadcrumbPage>{part}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink href={href}>{part}</BreadcrumbLink>
        )}
      </BreadcrumbItem>
    );

    if (!isLast) {
      breadcrumbElements.push(<BreadcrumbSeparator key={`sep-${index}`} />);
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbElements}</BreadcrumbList>
    </Breadcrumb>
  );
}
