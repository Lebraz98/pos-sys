"use client";
import { Box } from "@mantine/core";
import React from "react";
import HeaderComponent from "./header-component";

export default function LayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <HeaderComponent />
      <Box component="main" h={"100%"}>
        {children}
      </Box>
    </div>
  );
}
