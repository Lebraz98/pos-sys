"use client";
import { Button, Divider, Drawer, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCurrency,
  IconDevicesDollar,
  IconDots,
  IconFiles,
  IconHistory,
  IconTools,
  IconUser,
  IconUserDollar,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function MenuComponent() {
  const [opened, menu] = useDisclosure(false);

  const { push } = useRouter();
  return (
    <>
      <Drawer
        opened={opened}
        position="right"
        onClose={menu.close}
        title="Management"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        size={"xs"}
        p={0}
        m={0}
      >
        <Drawer.Body p={0} m={0}>
          <Stack>
            <Button
              fullWidth
              leftSection={<IconFiles />}
              style={{
                backgroundColor: "transparent",
                color: "ThreeDDarkShadow",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/products");
              }}
            >
              Products
            </Button>
            <Button
              fullWidth
              leftSection={<IconTools />}
              style={{
                backgroundColor: "transparent",
                color: "ThreeDDarkShadow",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/items");
              }}
            >
              Items
            </Button>
            <Button
              fullWidth
              leftSection={<IconTools />}
              style={{
                backgroundColor: "transparent",
                color: "ThreeDDarkShadow",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/items-needed");
              }}
            >
              Item Needed
            </Button>
            <Divider />
            <Button
              fullWidth
              leftSection={<IconHistory />}
              style={{
                backgroundColor: "transparent",
                color: "ThreeDDarkShadow",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/sale-history");
              }}
            >
              View Sales History
            </Button>
            <Button
              fullWidth
              leftSection={<IconUser />}
              style={{
                backgroundColor: "transparent",
                color: "ThreeDDarkShadow",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/customers");
              }}
            >
              Customers{" "}
            </Button>
            <Button
              fullWidth
              leftSection={<IconDevicesDollar />}
              style={{
                backgroundColor: "transparent",
                color: "ThreeDDarkShadow",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/rates");
              }}
            >
              Rate{" "}
            </Button>
          </Stack>
        </Drawer.Body>
      </Drawer>
      <Button
        fullWidth
        color="gray"
        h={80}
        onClick={() => {
          menu.open();
        }}
      >
        <IconDots />
      </Button>
    </>
  );
}
