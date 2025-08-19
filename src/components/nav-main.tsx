"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface NavItem {
  title: string;
  url: string;
  isActive?: boolean;
}

interface MainNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[];
}

// Fungsi untuk mengelompokkan items berdasarkan kategori
const groupItemsByCategory = (items: MainNavItem[]) => {
  const categories = [
    {
      label: "Manajemen Data Sekolah",
      items: items.slice(0, 2), // Profil Sekolah, Manajemen Tahun Ajaran
    },
    {
      label: "Manajemen Pengguna",
      items: items.slice(2, 4), // Data Guru & Staff, Data Siswa
    },
    {
      label: "Manajemen Akademik",
      items: items.slice(4, 7), // Kurikulum, Kelas & Jurusan, Jadwal Pelajaran
    },
    {
      label: "Manajemen Keuangan",
      items: items.slice(7, 9), // SPP, Keuangan Sekolah
    },
    {
      label: "Laporan & Analisis",
      items: items.slice(9, 10), // Laporan & Analisis
    },
    {
      label: "Pengaturan Sistem",
      items: items.slice(10, 11), // Pengaturan Sistem
    },
  ];

  return categories.filter((category) => category.items.length > 0);
};

export function NavMain({ items }: { items: MainNavItem[] }) {
  const groupedCategories = groupItemsByCategory(items);

  return (
    <>
      {groupedCategories.map((category) => (
        <SidebarGroup key={category.label}>
          <SidebarGroupLabel>{category.label}</SidebarGroupLabel>
          <SidebarMenu>
            {category.items.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subItem.isActive}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
