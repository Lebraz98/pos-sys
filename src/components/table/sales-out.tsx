"use client";
import { createSale } from "@/services/sale-service";
import type { Customer, Item } from "@/types";
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
  TableScrollContainer,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCalculator,
  IconMoneybag,
  IconNote,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import MenuComponent from "../layout/menu-component";

export default function SaleItemsTable(props: {
  items: Item[];
  customers: Customer[];
}) {
  const searchQuery = useSearchParams();

  const [search, setSearch] = useState<string>("");

  const form = useForm<SaleValidator>({
    resolver: zodResolver(SaleValidator),
    defaultValues: {
      saleItems: [],
      status: "open",
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
  const itemSearchResult = useMemo(() => {
    if (search === "") {
      return [];
    }
    const findItem = props.items.find((item) => item.serialNumber === search);
    if (findItem) {
      addItem(findItem);
    }
    return props.items.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(search.toLowerCase())
    );
  }, [addItem, props.items, search]);

  const items = useMemo(() => {
    return props.items.reduce(
      (acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      },
      {} as {
        [k in number]: Item;
      }
    );
  }, [props.items]);
  const [isPeding, setTransition] = useTransition();

  const totals = useMemo(() => {
    return watchItems.reduce(
      (acc, cur) => {
        const item = items[cur.itemId];
        if (cur) {
          acc.total += cur.price * cur.quantity;
          acc.discount += cur.price * cur.quantity - acc.total;
        }
        return acc;
      },
      {
        discount: 0,
        total: 0,
      }
    );
  }, [items, watchItems]);
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
  const handleSubmit = useCallback(
    (data: SaleValidator) => {
      setTransition(() => {
        createSale(data).then((res) => {
          notifications.show({ message: res.message });
          route.replace("/dashboard");
          form.reset();
        });
      });
    },
    [form, route]
  );

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
              name="invoiceId"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextInput
                  error={fieldState.error?.message}
                  label="Invoice Id"
                  dir="auto"
                  onChange={field.onChange}
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
            <Button type="submit" mt={5} loading={isPeding} fullWidth>
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
                    style={{ cursor: "pointer", fontSize: 20 }}
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
        <Card shadow="xs" padding="xl" radius="0" withBorder h={340}>
          <Stack h={"100%"}>
            <Flex justify="space-between">
              <Title order={4}>Total:</Title>
              <Title order={4}>
                $<NumberFormatter thousandSeparator="," value={totals.total} />
              </Title>
            </Flex>

            <Divider variant="dotted" size={"md"} />
            <Flex justify="space-between">
              <Title order={4}>Subtotal:</Title>
              <Title order={4}>
                $
                <NumberFormatter thousandSeparator="," value={totals.total} />
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
          <TableScrollContainer minWidth={"100%"}>
            <Table
              styles={{
                td: {
                  fontSize: 20,
                },
              }}
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
                        value={value.price}
                        thousandSeparator=","
                      />
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={value.price * value.quantity}
                        thousandSeparator=","
                      />{" "}
                    </Table.Td>
                    <Table.Td style={{ backgroundColor: "green" }}>
                      $
                      <NumberFormatter
                        value={value.price * value.quantity}
                        thousandSeparator=","
                      />{" "}
                    </Table.Td>

                    <Table.Td
                      style={{
                        width: 150,
                        backgroundColor:
                          value.price - items[value.itemId].buy > 0
                            ? "green"
                            : "red",
                      }}
                    >
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
          </TableScrollContainer>
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
              disabled={selectedItem === -1}
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
              disabled={selectedItem === -1}
              onClick={() => {
                const old = watchItems[selectedItem];
                if (old) {
                  const quantity = prompt(
                    "Enter the quantity: ",
                    old.quantity + ""
                  );
                  if (quantity) {
                    if (/^\d+(\.\d+)?$/.test(quantity)) {
                      form.setValue(
                        "saleItems",
                        watchItems.map((item, i) =>
                          i === selectedItem
                            ? {
                                ...item,
                                quantity: parseFloat(quantity),
                                total: item.price * parseFloat(quantity),
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
              disabled={selectedItem === -1}
              onClick={() => {
                const old = watchItems[selectedItem];
                if (old) {
                  const price = prompt("Enter the price: ", old.price + "");
                  if (price) {
                    if (/^-?\d+(\.\d+)?$/.test(price)) {
                      form.setValue(
                        "saleItems",
                        watchItems.map((item, i) =>
                          i === selectedItem
                            ? {
                                ...item,
                                price: parseFloat(price),

                                total: item.price * parseFloat(price),
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
              Price
            </Button>
            <Button
              fullWidth
              disabled={selectedItem === -1}
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
              color="green"
              style={{
                height: "80px",
              }}
              onClick={() => {
                form.setValue("type", "cash");
                route.push("/dashboard?type=cash");
              }}
            >
              Cash
            </Button>
            <Button
              onClick={() => {
                form.setValue("type", "credit");

                route.push("/dashboard?type=credit");
              }}
              fullWidth
              color="blue"
              style={{
                height: "80px",
              }}
            >
              Credit
            </Button>
            <Button
              onClick={() => {
                form.setValue("type", "return");

                route.push("/dashboard?type=retrun");
              }}
              fullWidth
              color="orange"
              style={{
                height: "80px",
              }}
            >
              Return
            </Button>
          </Flex>
          <Flex gap={3}>
            <Button
              onClick={() => {
                form.setValue("type", "waiting");

                route.push("/dashboard?type=waiting");
              }}
              fullWidth
              color="yellow"
              style={{
                height: "80px",
              }}
            >
              Waiting
            </Button>
            <Button
              onClick={() => {
                form.setValue("type", "expensive");

                route.push("/dashboard?type=expensive");
              }}
              fullWidth
              color="red"
              style={{
                height: "80px",
              }}
            >
              Expensive
            </Button>
            <div style={{ width: "100%" }}> </div>
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
