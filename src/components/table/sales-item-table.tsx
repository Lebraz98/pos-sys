"use client";
import SaleValidator from "@/validator/sale-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  List,
  Modal,
  NumberFormatter,
  ScrollArea,
  Select,
  Stack,
  Table,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { Customer, Item, Prisma } from "@prisma/client";
import {
  IconCalculator,
  IconMoneybag,
  IconNote,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import MenuComponent from "../layout/menu-component";

export default function SaleItemsTable(props: {
  items: Prisma.ItemGetPayload<{
    include: {
      product: true;
    };
  }>[];
  customers: Customer[];
}) {
  const searchQuery = useSearchParams();

  const [search, setSearch] = useState<string>("");
  const itemSearchResult = useMemo(() => {
    return search === ""
      ? []
      : props.items.filter(
          (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.serialNumber?.toLowerCase().includes(search.toLowerCase())
        );
  }, [props.items, search]);
  const form = useForm<SaleValidator>({
    resolver: zodResolver(SaleValidator),
    defaultValues: {
      saleItems: [],
      status: "OPEN",
    },
  });

  const [selectedItem, setSelectedItem] = useState(-1);
  const watchItems = useWatch({
    control: form.control,
    defaultValue: [],
    name: "saleItems",
  });

  const addItem = useCallback(
    (e: Item) => {
      form.setValue(
        "saleItems",
        [
          ...watchItems,
          {
            itemId: e.id,
            quantity: 1,
            price: e.sell,
            total: e.sell,
            saleId: 0,
          } as any,
        ].reverse()
      );
      setSearch("");
      setSelectedItem(0);
    },
    [form, watchItems]
  );

  const items = useMemo(() => {
    return props.items.reduce(
      (acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      },
      {} as {
        [k in number]: Prisma.ItemGetPayload<{
          include: {
            product: true;
          };
        }>;
      }
    );
  }, [props.items]);

  const handleSubmit = useCallback(
    (data: SaleValidator) => {
      console.log(data);
    },
    [form]
  );
  const totals = useMemo(() => {
    return watchItems.reduce(
      (acc, cur) => {
        const item = items[cur.itemId];
        if (cur) {
          acc.total += cur.price * cur.quantity;
          acc.discount += item.sell * cur.quantity - cur.price * cur.quantity;
        }
        return acc;
      },
      {
        discount: 0,
        total: 0,
      }
    );
  }, [watchItems]);
  const onSelect = useCallback((i: number) => setSelectedItem(i), []);

  const customers = useMemo(
    () =>
      props.customers.map((customer) => ({
        label: customer.name,
        value: customer.id.toString(),
      })),
    [props.customers]
  );
  const route = useRouter();
  console.log(form.formState.errors);

  return (
    <Flex
      style={{
        height: "calc(100vh - 90px)",
      }}
    >
      <Modal
        title="Sale Form"
        opened={searchQuery.get("type") ? true : false}
        onClose={() => {
          route.replace("/dashboard");
        }}
      >
        <Modal.Body>
          <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
            <Controller
              name="customerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  data={customers}
                  label="Customer"
                  searchable
                  placeholder="Select customer"
                  error={fieldState.error?.message}
                  onChange={(value) => {
                    if (value) {
                      field.onChange(+value);
                    } else {
                      field.onChange(null);
                    }
                  }}
                />
              )}
            />

            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Textarea
                  error={fieldState.error?.message}
                  label="Note"
                  resize="vertical"
                  dir="auto"
                  onChange={field.onChange}
                />
              )}
            />
            <Button type="submit" mt={5}>
              Submit
            </Button>
          </Box>
        </Modal.Body>
      </Modal>

      <Stack flex={1}>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (itemSearchResult.length > 0) {
              addItem(itemSearchResult[0]);
            }
          }}
        >
          <TextInput
            value={search}
            placeholder="Search for item"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Box
            style={{
              zIndex: 100,
              border: "1px solid #000",
              width: "auto",
              height: "200px",
              overflow: "auto",
            }}
          >
            <List p={5}>
              {itemSearchResult.map((item) => (
                <div key={item.id}>
                  <List.Item
                    onClick={() => {
                      addItem(item);
                      setSelectedItem(watchItems.length + 1);
                    }}
                    style={{ cursor: "pointer" }}
                    bg={"gray"}
                    p={5}
                  >
                    ({item.serialNumber}) {item.name} - $
                    <NumberFormatter value={item.sell} />
                  </List.Item>
                  <Divider />
                </div>
              ))}
            </List>
          </Box>
        </Box>
        <Card shadow="xs" padding="xl" radius="0" withBorder h={"320px"}>
          <Stack h={"100%"}>
            <Flex justify="space-between">
              <Title order={4}>Total:</Title>
              <Title order={4}>
                $<NumberFormatter thousandSeparator="," value={totals.total} />
              </Title>
            </Flex>
            <Flex justify="space-between">
              <Title order={4}>Discount:</Title>
              <Title order={4}>
                $
                <NumberFormatter
                  thousandSeparator=","
                  value={totals.discount}
                />
              </Title>
            </Flex>
            <Divider variant="dotted" size={"md"} />
            <Flex justify="space-between">
              <Title order={4}>Subtotal:</Title>
              <Title order={4}>
                $
                <NumberFormatter
                  thousandSeparator=","
                  value={totals.total - totals.discount}
                />
              </Title>
            </Flex>
          </Stack>
        </Card>
        <Stack
          style={{
            maxHeight: "calc(100vh - 340px)",
            height: "100%",
            overflow: "auto",
          }}
        >
          <ScrollArea>
            <Table
              verticalSpacing={"md"}
              highlightOnHover
              stickyHeader
              captionSide="top"
            >
              <Table.Caption>Total Items: {watchItems.length}</Table.Caption>
              <Table.Thead style={{ zIndex: 0 }}>
                <Table.Tr>
                  <Table.Th>Serial Number</Table.Th>
                  <Table.Th>Item Name</Table.Th>
                  <Table.Th>Product Name</Table.Th>
                  <Table.Th>Note</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Buy per item</Table.Th>
                  <Table.Th>Sell per item</Table.Th>
                  <Table.Th>Price Before Discount</Table.Th>
                  <Table.Th>Price After Discount</Table.Th>
                  <Table.Th>Loss</Table.Th>
                  <Table.Th>Win</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {watchItems.map((value, index) => (
                  <Table.Tr
                    onClick={() => onSelect(index)}
                    bg={index == selectedItem ? "gray" : ""}
                    key={index}
                  >
                    <Table.Td>{items[value.itemId].serialNumber}</Table.Td>
                    <Table.Td>{items[value.itemId].name}</Table.Td>
                    <Table.Td>{items[value.itemId].product.name}</Table.Td>
                    <Table.Td dir="auto">{value.note}</Table.Td>

                    <Table.Td>{value.quantity}</Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter value={items[value.itemId].buy} />
                    </Table.Td>

                    <Table.Td>
                      $
                      <NumberFormatter
                        value={items[value.itemId].sell}
                        thousandSeparator=","
                      />
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={items[value.itemId].sell * value.quantity}
                        thousandSeparator=","
                      />{" "}
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={value.price * value.quantity}
                        thousandSeparator=","
                      />{" "}
                    </Table.Td>

                    <Table.Td>
                      $
                      <NumberFormatter
                        value={
                          items[value.itemId].sell * value.quantity -
                          value.price * value.quantity
                        }
                        thousandSeparator=","
                      />{" "}
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={
                          value.price * value.quantity -
                          items[value.itemId].buy * value.quantity
                        }
                        thousandSeparator=","
                      />{" "}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
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
            <Button
              onClick={() => {
                const item = watchItems[selectedItem];
                if (selectedItem > -1 && item) {
                  if (
                    confirm(
                      "Are you sure to delete item " +
                        items[item.itemId].name +
                        "?"
                    )
                  ) {
                    form.setValue(
                      "saleItems",
                      watchItems.filter((_, i) => i !== selectedItem)
                    );
                  }
                  setSelectedItem(-1);
                }
              }}
              fullWidth
              leftSection={<IconX />}
              color="red"
            >
              Remove
            </Button>
            <Button
              onClick={() => {
                const old = watchItems[selectedItem];
                if (old) {
                  const quantity = prompt(
                    "Enter the quantity: ",
                    old.quantity + ""
                  );
                  if (quantity) {
                    if (/^\d+$/.test(quantity)) {
                      form.setValue(
                        "saleItems",
                        watchItems.map((item, i) =>
                          i === selectedItem
                            ? {
                                ...item,
                                quantity: parseInt(quantity),
                                total: item.price * parseInt(quantity),
                              }
                            : item
                        )
                      );
                    } else {
                      alert("Invalid input. Please enter numbers only.");
                    }
                  }
                }
              }}
              fullWidth
              leftSection={<IconCalculator />}
              color="gray"
            >
              Quantity
            </Button>

            <Button
              fullWidth
              leftSection={<IconMoneybag />}
              color="blue"
              onClick={() => {
                const old = watchItems[selectedItem];
                if (old) {
                  const price = prompt("Enter the price: ", old.price + "");
                  if (price) {
                    if (/^\d+$/.test(price)) {
                      form.setValue(
                        "saleItems",
                        watchItems.map((item, i) =>
                          i === selectedItem
                            ? {
                                ...item,
                                price: parseInt(price),
                                total: item.price * parseInt(price),
                              }
                            : item
                        )
                      );
                    } else {
                      alert("Invalid input. Please enter numbers only.");
                    }
                  }
                }
              }}
            >
              Sell
            </Button>
            <Button
              fullWidth
              leftSection={<IconNote />}
              color="green"
              onClick={() => {
                const old = watchItems[selectedItem];
                if (old) {
                  const note = prompt("Enter the note: ", old.note ?? "" + "");
                  form.setValue(
                    "saleItems",
                    watchItems.map((item, i) =>
                      i === selectedItem
                        ? {
                            ...item,
                            note: note,
                          }
                        : item
                    )
                  );
                }
              }}
            >
              Note
            </Button>
          </Flex>
          <Flex justify={"space-between"} gap={3} style={{}}>
            <Button
              fullWidth
              color="gray"
              style={{
                height: "80px",
              }}
              onClick={() => {
                form.setValue("type", "CASH");
                route.push("/dashboard?type=cash");
              }}
            >
              Cash
            </Button>
            <Button
              onClick={() => {
                form.setValue("type", "CREDIT");

                route.push("/dashboard?type=credit");
              }}
              fullWidth
              color="gray"
              style={{
                height: "80px",
              }}
            >
              Credit
            </Button>
          </Flex>
        </Stack>
        <Stack>
          <Flex justify={"space-between"} gap={3} style={{}}>
            <Button
              fullWidth
              leftSection={<IconTrash />}
              color="red"
              onClick={() =>
                confirm("Are you sure to void order?") ? form.reset() : null
              }
            >
              Void Order
            </Button>

            <MenuComponent />
          </Flex>
        </Stack>
      </Card>
    </Flex>
  );
}
