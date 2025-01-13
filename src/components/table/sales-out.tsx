"use client";
import { createSale } from "@/services/sale-service";
import type { Customer, Item } from "@/types";
import SaleValidator from "@/validator/sale-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Modal,
  NumberFormatter,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  TableScrollContainer,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import MenuComponent from "../layout/menu-component";

export default function SaleItemsTable(props: {
  items: Item[];
  customers: Customer[];
  rate?: number;
}) {
  const searchQuery = useSearchParams();
  const filteredItems = useMemo(
    () =>
      props.items.map(
        (res) => `${res.serialNumber ? res.serialNumber + " " : ""} ${res.name}`
      ),
    [props.items]
  );
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
      const itemRow = document.getElementById(`table-item-${0}}`);
      itemRow?.scrollIntoView();
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
  }, [watchItems]);

  useMemo(() => {
    form.setValue("total", totals.total);
  }, [form, totals.total]);

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
        const invoiceType = searchQuery.get("type");

        if (
          (invoiceType === "credit" || invoiceType === "expensive") &&
          data.customerId === undefined
        ) {
          form.setError("customerId", {
            message: "Customer Required",
            type: "validate",
          });
          return;
        }

        createSale(data).then((res) => {
          notifications.show({ message: res.message });
          route.replace("/dashboard");
          form.reset();
        });
      });
    },
    [form, route,searchQuery]
  );
  const [searchedItems, setSearchedItems] = useState<Item[] | null>(null);

  const handleSearch = useCallback(
    (item: Item) => {
      setTransition(() => {
        addItem(item);
      });
    },
    [addItem]
  );
  return (
    <Container size={"xxl"}>
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
                  withAsterisk={searchQuery.get("type") === "credit"}
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
            {form.watch("type") === "credit" && (
              <Controller
                name="paid"
                control={form.control}
                render={({ field }) => (
                  <NumberInput
                    value={field.value ?? 0}
                    min={0}
                    max={totals.total}
                    label="Paid"
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                )}
              />
            )}
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
            <Controller
              name="total"
              control={form.control}
              render={({ field }) => (
                <NumberInput
                  label="Total"
                  dir="auto"
                  onChange={field.onChange}
                  value={field.value as number}
                />
              )}
            />
            <Button type="submit" mt={5} loading={isPeding} fullWidth>
              Submit
            </Button>
          </Box>
        </Modal.Body>
      </Modal>

      <Flex w={"100%"} h={"calc(100vh - 185px)"} gap={25}>
        <Stack w={"100%"}>
          <Flex
            component="form"
            align={"center"}
            gap={10}
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("input-search")?.blur();

              document.getElementById("input-search")?.focus();
            }}
          >
            <Select
              w={"100%"}
              variant={"filled"}
              placeholder="Scan barcode to item"
              data={search !== "" ? filteredItems : []}
              value={search}
              onChangeCapture={(e) => {
                setSearch((e.target as any).value);
              }}
              searchable
              rightSection
              id="input-search"
              onChange={(value) => {
                setSearch("");
                document.getElementById("input-search")?.blur();
                const item = props.items.find(
                  (res) =>
                    value ===
                    `${res.serialNumber ? res.serialNumber + " " : ""} ${
                      res.name
                    }`
                );

                if (item) {
                  handleSearch(item);
                }

                document.getElementById("input-search")?.focus();
              }}
              clearable
            />
          </Flex>
          <TableScrollContainer minWidth={"100%"} id="table-scroll">
            <Table h={"100%"} border={0} darkHidden highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Index</Table.Th>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Note</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {watchItems.map((item, index) => (
                  <Table.Tr
                    id={`table-item-${index}`}
                    key={index}
                    onClick={() => onSelect(index)}
                    bg={index === selectedItem ? "gray" : ""}
                  >
                    <Table.Td>{index}</Table.Td>
                    <Table.Td>{items[item.itemId].serialNumber}</Table.Td>
                    <Table.Td>{items[item.itemId].name}</Table.Td>
                    <Table.Td>{item.note}</Table.Td>

                    <Table.Td>{item.quantity}</Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter value={item.price} />
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={item.price * item.quantity}
                        thousandSeparator
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </TableScrollContainer>
        </Stack>
        <Card w={"400px"} radius="md" withBorder>
          <Stack h={"100%"} gap={10} bd={1}>
            <Card radius="md" withBorder>
              <Card.Section p={10}>
                <Title>Total</Title>

                <Text
                  size="xl"
                  style={{
                    textAlign: "end",
                  }}
                >
                  $ <NumberFormatter value={totals.total} thousandSeparator />
                </Text>
                <Text
                  size="xl"
                  style={{
                    textAlign: "end",
                  }}
                >
                  ل.ل{" "}
                  <NumberFormatter
                    value={Math.ceil(totals.total * (props.rate ?? 0))}
                    thousandSeparator
                  />
                </Text>
              </Card.Section>
            </Card>
            <Button
              disabled={watchItems.length === 0}
              onClick={() => {
                form.setValue("type", "cash");
                route.push("/dashboard?type=cash");
              }}
              color="green"
              size="xl"
              fullWidth
            >
              Pay
            </Button>
            <Button
              color="red"
              disabled={watchItems.length === 0}
              size="xl"
              fullWidth
              onClick={() => {
                form.setValue("type", "credit");
                route.push("/dashboard?type=credit");
              }}
            >
              Credit
            </Button>
            <Button
              color="red"
              disabled={watchItems.length === 0}
              size="xl"
              fullWidth
              onClick={() => {
                form.setValue("type", "credit");
                route.push("/dashboard?type=expensive");
              }}
            >
              Expensive
            </Button>
            <SimpleGrid cols={2}>
              <Button
                onClick={() => {
                  if (confirm("Are you sure to void order?")) {
                    form.reset();
                    setSearch("");
                    setSelectedItem(-1);
                  }
                }}
                color="gray"
                size="xl"
                fullWidth
              >
                Void
              </Button>
              <Button color="gray" size="xl" fullWidth disabled></Button>
            </SimpleGrid>
          </Stack>
        </Card>
      </Flex>
      <SimpleGrid cols={{ xs: 7 }} styles={{}} mt={10}>
        <Button
          onClick={() => {
            const item = watchItems[selectedItem];
            if (item) {
              form.setValue(
                "saleItems",
                watchItems.filter((_, i) => i !== selectedItem)
              );
            }
            if (selectedItem < watchItems.length - 1) {
              setSelectedItem(selectedItem + 1);
            }
          }}
          bg={"gray"}
          fullWidth
          h={"80px"}
        >
          Delete
        </Button>
        <Button
          bg={"gray"}
          fullWidth
          h={"80px"}
          onClick={() => {
            if (selectedItem != 0) {
              setSelectedItem(selectedItem - 1);

              const itemRow = document.getElementById(
                `table-item-${selectedItem - 1}`
              );
              itemRow?.scrollIntoView();
            }
          }}
        >
          <IconArrowUp />
        </Button>
        <Button
          onClick={() => {
            if (selectedItem != watchItems.length - 1) {
              setSelectedItem(selectedItem + 1);
              const itemRow = document.getElementById(
                `table-item-${selectedItem + 1}`
              );
              itemRow?.scrollIntoView();
            }
          }}
          bg={"gray"}
          fullWidth
          h={"80px"}
        >
          <IconArrowDown />
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
          bg={"gray"}
          fullWidth
          h={"80px"}
        >
          Quantity
        </Button>
        <Button
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
          bg={"gray"}
          fullWidth
          h={"80px"}
        >
          Price
        </Button>
        <Button
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
          bg={"gray"}
          fullWidth
          h={"80px"}
        >
          Note
        </Button>
        <MenuComponent />
      </SimpleGrid>
    </Container>
  );
}
{
  /* <Flex
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
      {form.watch("type") === "credit" && (
        <Controller
          name="paid"
          control={form.control}
          render={({ field }) => (
            <NumberInput
              value={field.value ?? 0}
              min={0}
              max={totals.total}
              label="Paid"
              onChange={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
      )}
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
      <Controller
        name="total"
        control={form.control}
        render={({ field }) => (
          <NumberInput
            label="Total"
            dir="auto"
            onChange={field.onChange}
            value={field.value as number}
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
  <Flex w={"100%"} gap={5}>
    <Box
      w={"100%"}
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
          {itemSearchResult.length === 0 && search !== "" && (
            <div>
              <Text>Result Not Found</Text>
            </div>
          )}
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
  </Flex>
  <Stack
    style={{
      maxHeight: "calc(100vh - 340px)",
      height: "100%",
      width: "100%",
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
            <Table.Th>Price After Discount ل.ل</Table.Th>

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
              <Table.Td style={{ backgroundColor: "green" }}>
                ل.ل
                <NumberFormatter
                  value={Math.ceil(
                    value.price * value.quantity * (props.rate ?? 1)
                  )}
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
    <Card w={"100%"} shadow="xs" padding="xl" radius="0" withBorder>
      <Stack h={"100%"}>
        <Flex justify="space-between">
          <Title order={4}>Total Items:</Title>
          <Title order={4}>{watchItems.length}</Title>
        </Flex>

        <Flex justify="space-between">
          <Title order={4}>Total In $:</Title>
          <Title order={4}>
            $
            <NumberFormatter thousandSeparator="," value={totals.total} />
          </Title>
        </Flex>

        <Divider variant="dotted" size={"md"} />
        <Flex justify="space-between">
          <Title order={4}>Total In L.L:</Title>
          <Title order={4}>
            ل.ل{" "}
            <NumberFormatter
              thousandSeparator=","
              value={Math.ceil(totals.total * (props.rate ?? 1))}
            />
          </Title>
        </Flex>
      </Stack>
    </Card>
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
</Flex> */
}
