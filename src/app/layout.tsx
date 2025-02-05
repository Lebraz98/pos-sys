import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
import "@mantine/core/styles.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

export const metadata: Metadata = {
  title: "POS",
  description: "POS",
};
const theme = createTheme({
  fontFamily: "Verdana, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: { fontFamily: "Greycliff CF, sans-serif" },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning suppressContentEditableWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider forceColorScheme="light" theme={theme}>
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
