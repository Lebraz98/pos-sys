"use client";
import { Button, Divider, Drawer, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDots, IconFiles, IconHistory } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function MenuComponent() {
  const [opened, menu] = useDisclosure(false);

  const { push } = useRouter();
  return (
    <>
      {" "}
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
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/products");
              }}
            >
              Products
            </Button>
            <Divider />
            <Button
              fullWidth
              leftSection={<IconHistory />}
              style={{
                backgroundColor: "transparent",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/products");
              }}
            >
              View Sales History
            </Button>
            <Button
              fullWidth
              leftSection={<IconHistory />}
              style={{
                backgroundColor: "transparent",
                display: "flex",
              }}
              onClick={() => {
                push("/dashboard/users");
              }}
            >
              Users
            </Button>
          </Stack>
        </Drawer.Body>
      </Drawer>
      <Button
        fullWidth
        leftSection={<IconDots />}
        color="gray"
        onClick={() => {
          menu.open();
        }}
      ></Button>
    </>
  );
}
