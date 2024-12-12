"use client";
import { deleteCustomer } from "@/services/customer-service";
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
import type { Customer } from "@prisma/client";
import { IconEdit, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import CustomerFrom from "../form/customer-form";

export default function CustomerTable(props: { data: Customer[] }) {
  const [search, setSearch] = useState<string>("");
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();
  const searchResult = useMemo(() => {
    return search === ""
      ? props.data
      : props.data.filter(
          (customer) =>
            customer.name.toLowerCase().includes(search.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(search.toLowerCase()) ||
            customer.address?.toLowerCase().includes(search.toLowerCase())
        );
  }, [props.data, search]);

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/customers?open=true&id=" + id);
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
              placeholder="Search for customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              mb={10}
            />

            <CustomerFrom />
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Action</Table.Th>
                  <Table.Th>Id</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Phone</Table.Th>
                  <Table.Th>Address</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {searchResult.map((customer) => (
                  <Table.Tr key={customer.id}>
                    <Table.Td>
                      <Flex gap={5}>
                        <ActionIcon onClick={() => onEdit(customer.id)}>
                          <IconEdit />
                        </ActionIcon>

                        <ActionIcon
                          color="red"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this customer?"
                              )
                            ) {
                              setTranstions(() => {
                                deleteCustomer(customer.id).then((data) => {
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
                    <Table.Td>{customer.id}</Table.Td>
                    <Table.Td>{customer.name}</Table.Td>
                    <Table.Td>{customer.phone}</Table.Td>
                    <Table.Td>{customer.address}</Table.Td>
                    <Table.Td>{customer.createdAt.toDateString()}</Table.Td>
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
