"use client";
import { Button, Card, Flex, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

export default function HeaderComponent() {
  const path = usePathname();
  const title = path.split("/")?.[2];
  const { replace } = useRouter();

  return (
    <Card radius={0} withBorder h={80}>
      <Flex w={"100%"} align={"center"}>
        {path !== "/dashboard" && (
          <div>
            <Button
              color="dark"
              variant="transparent"
              onClick={() => replace("/dashboard")}
            >
              <IconArrowLeft width={50} />
            </Button>
          </div>
        )}
        <Title style={{ textTransform: "capitalize" }}>
          {title ?? "POS System"}
        </Title>
      </Flex>
    </Card>
  );
}
