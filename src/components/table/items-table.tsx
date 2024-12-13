"use client";
import { deleteItem } from "@/services/item-service";
import {
  ActionIcon,
  Box,
  Card,
  Flex,
  LoadingOverlay,
  NumberFormatter,
  Table,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Item, Product } from "@prisma/client";
import { IconEdit, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import ItemFrom from "../form/item-form";

export default function ItemTable(props: {
  data: Item[];
  products: Product[];
}) {
  const [search, setSearch] = useState<string>("");
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();
  const searchResult = useMemo(() => {
    return search === ""
      ? props.data
      : props.data.filter(
          (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase())
        );
  }, [props.data, search]);

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/items?open=true&id=" + id);
    },
    [route]
  );
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <Box p={5}>
        <Card maw={1500} m={"auto"}>
          <Table.ScrollContainer minWidth={500} type="native">
            <LoadingOverlay visible={isPending} />
            <TextInput
              placeholder="Search for item"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              mb={10}
            />

            <ItemFrom products={props.products} />
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Serial Number</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Buy</Table.Th>
                  <Table.Th>Sell</Table.Th>

                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {searchResult.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Flex gap={5}>
                        <ActionIcon onClick={() => onEdit(item.id)}>
                          <IconEdit />
                        </ActionIcon>

                        <ActionIcon
                          color="red"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this item?"
                              )
                            ) {
                              setTranstions(() => {
                                deleteItem(item.id).then((data) => {
                                  if (data.error) {
                                    notifications.show({
                                      message: data.message,
                                      color: "red",
                                    });
                                  } else {
                                    route.refresh();
                                    notifications.show({
                                      message: data.message,
                                      color: "green",
                                    });
                                  }
                                });
                              });
                            }
                          }}
                        >
                          <IconX />
                        </ActionIcon>
                      </Flex>
                    </Table.Td>
                    <Table.Td>{item.serialNumber}</Table.Td>
                    <Table.Td>{item.name}</Table.Td>
                    <Table.Td>{item.description}</Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter value={item.buy} thousandSeparator="," />
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={item.sell}
                        thousandSeparator=","
                      />
                    </Table.Td>

                    <Table.Td>{item.createdAt.toDateString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Box>
    </Suspense>
  );
}
