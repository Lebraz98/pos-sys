import LayoutComponent from "@/components/layout/layout-components";
import { getLastRate } from "@/services/rate-service";
import { NumberFormatter } from "@mantine/core";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rate = await getLastRate();
  return (
    <LayoutComponent>
      <div
        style={{
          textAlign: "center",
          backgroundColor: "green",
          padding: "10px",
          marginBottom: "10px",
          color: "white",
          fontSize: "20px",
          position: "absolute",
          top: "0",
          right: "0",
        }}
      >
        Rate:{" "}
        {<NumberFormatter value={rate ? rate.value : 0} thousandSeparator />}
        ل.ل
      </div>
      {children}
    </LayoutComponent>
  );
}
