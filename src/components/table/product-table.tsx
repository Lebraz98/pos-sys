"use client";
import { deleteProduct } from "@/services/product-service";
import {
  ActionIcon,
  Box,
  Card,
  Flex,
  LoadingOverlay,
  Table,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Product } from "@prisma/client";
import { IconEdit, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import ProductFrom from "../form/product-form";

export default function ProductTable(props: { data: Product[] }) {
  const [search, setSearch] = useState<string>("");
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();
  const searchResult = useMemo(() => {
    return search === ""
      ? props.data
      : props.data.filter(
          (product) =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(search.toLowerCase()) ||
            product.description?.toLowerCase().includes(search.toLowerCase())
        );
  }, [props.data, search]);

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/products?open=true&id=" + id);
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
              placeholder="Search for product"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              mb={10}
            />

            <ProductFrom />
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>BarCode</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {searchResult.map((product) => (
                  <Table.Tr key={product.id}>
                    <Table.Td>
                      <Flex gap={5}>
                        <ActionIcon onClick={() => onEdit(product.id)}>
                          <IconEdit />
                        </ActionIcon>

                        <ActionIcon
                          color="red"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this product?"
                              )
                            ) {
                              setTranstions(() => {
                                deleteProduct(product.id).then((data) => {
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
                    <Table.Td>{product.barcode}</Table.Td>
                    <Table.Td>{product.name}</Table.Td>
                    <Table.Td>{product.description}</Table.Td>
                    <Table.Td>{product.createdAt.toDateString()}</Table.Td>
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
