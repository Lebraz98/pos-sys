import LayoutComponent from "@/components/layout/layout-components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutComponent>{children}</LayoutComponent>;
}
