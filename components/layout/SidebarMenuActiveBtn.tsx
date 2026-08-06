"use client";

import React from "react";
import { SidebarMenuButton } from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
export const SidebarMenuActiveBtn = ({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
}) => {
  const pathName = usePathname();
  const isActive = pathName === href || pathName.startsWith(`${href}/`);
  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={href}>
        {icon}
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
};
