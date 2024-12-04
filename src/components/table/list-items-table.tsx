"use client";
import {
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Flex,
  ScrollArea,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCalculator,
  IconDots,
  IconFiles,
  IconHistory,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function ListItemsTable() {
  const [opened, menu] = useDisclosure(false);

  const { push } = useRouter();
  return (
    <Flex>
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
          </Stack>
        </Drawer.Body>
      </Drawer>

      <Stack
        flex={1}
        style={{
          height: "calc(100vh - 80px)",
        }}
      >
        <Box component="form">
          <TextInput placeholder="Search for product" radius={0} />
        </Box>
        <ScrollArea>
          <Table
            verticalSpacing={"md"}
            highlightOnHover
            stickyHeader
            captionSide="top"
          >
            <Table.Caption>Total Items: 15</Table.Caption>
            <Table.Thead style={{ zIndex: 0 }}>
              <Table.Tr>
                <Table.Th>Product Name</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Amount</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Array.from({ length: 500 }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td>Product 1</Table.Td>
                  <Table.Td>1</Table.Td>
                  <Table.Td>$10</Table.Td>
                  <Table.Td>$10</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Card shadow="xs" padding="xl" radius="0" withBorder>
          <Stack h={"100%"}>
            <Flex justify="space-between">
              <Title order={4}>Total:</Title>
              <Title order={4}>$5000</Title>
            </Flex>
            <Flex justify="space-between">
              <Title order={4}>Discount:</Title>
              <Title order={4}>$500</Title>
            </Flex>
            <Flex justify="space-between">
              <Title order={4}>Subtotal:</Title>
              <Title order={4}>$4500</Title>
            </Flex>
            <Divider variant="dotted" size={"md"} />
            <Flex justify="space-between">
              <Title order={4}>Total</Title>
              <Title order={4}>$4950</Title>
            </Flex>
          </Stack>
        </Card>
      </Stack>

      <Card
        withBorder
        style={{
          width: "520px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "20px",
        }}
        shadow="xs"
        padding="xs"
        radius="0"
      >
        <Stack>
          <Flex justify={"space-between"} gap={3} style={{}}>
            <Button fullWidth leftSection={<IconX />} color="red">
              Remove
            </Button>
            <Button fullWidth leftSection={<IconCalculator />} color="gray">
              Quantity
            </Button>
            <Button fullWidth leftSection={<IconSearch />} color="blue">
              Search
            </Button>
            <Button fullWidth leftSection={<IconPlus />} color="green">
              Add
            </Button>
          </Flex>
          <Flex justify={"space-between"} gap={3} style={{}}>
            <Button
              fullWidth
              color="gray"
              style={{
                height: "80px",
              }}
            >
              Cash
            </Button>
            <Button
              fullWidth
              color="gray"
              style={{
                height: "80px",
              }}
            >
              Credit
            </Button>
            <Button
              fullWidth
              color="gray"
              style={{
                height: "80px",
              }}
            >
              Check
            </Button>
          </Flex>
        </Stack>
        <Stack>
          <Flex justify={"space-between"} gap={3} style={{}}>
            <Button fullWidth leftSection={<IconTrash />} color="red">
              Void Order
            </Button>

            <Button fullWidth leftSection={<IconUsersGroup />} color="blue">
              Customer
            </Button>
            <Button
              fullWidth
              leftSection={<IconDots />}
              color="gray"
              onClick={() => {
                menu.open();
              }}
            ></Button>
          </Flex>
        </Stack>
      </Card>
    </Flex>
  );
}
