"use client";
import { deleteProduct } from "@/services/product-service";
import type { Customer } from "@/types";
import { Box, Flex, LoadingOverlay, MenuItem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconX } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useTransition } from "react";
import CustomerFrom from "../form/customer-form";
import { deleteCustomer } from "@/services/customer-service";

export default function CustomerTable(props: { data: Customer[] }) {
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/customers?open=true&id=" + id);
    },
    [route]
  );
  const table = useMantineReactTable({
    columns,
    data: props.data,
    enablePagination: false,
    initialState: {
      showColumnFilters: true,
    },

    mantineLoadingOverlayProps: {
      visible: isPending,
    },
    enableRowActions: true,
    renderRowActionMenuItems: (data) => [
      <MenuItem
        key={0}
        onClick={() => {
          onEdit(data.row.original.id);
        }}
      >
        <IconEdit />
      </MenuItem>,
      <MenuItem
        color="red"
        key={1}
        onClick={() => {
          setTranstions(() => {
            deleteCustomer(data.row.original.id).then((data) => {
              if (data) {
                notifications.show({
                  message: data.message,
                  color: "red",
                });
              }
            });
          });
        }}
      >
        <IconX />
      </MenuItem>,
    ],
  });

  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <Box
        p={10}
        style={{
          height: "calc(100vh - 90px)",
          overflow: "auto",
        }}
      >
        <Flex justify={"end"} mb={10}>
          <CustomerFrom />
        </Flex>

        <MantineReactTable table={table} />
      </Box>
    </Suspense>
  );
}
const columns: MRT_ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
];
