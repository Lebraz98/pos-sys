"use client";
import { deleteProduct } from "@/services/product-service";
import type { Product } from "@/types";
import {
  Box,
  Flex,
  LoadingOverlay,
  MenuItem,
  Table,
  TableScrollContainer,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconX } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useTransition } from "react";
import ProductFrom from "../form/product-form";

export default function ProductTable(props: { data: Product[] }) {
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/products?open=true&id=" + id);
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
    enableExpanding: true,
    renderDetailPanel: (data) => {
      return (
        <Box>
          <TableScrollContainer minWidth={"100%"}>
            <Table withRowBorders withColumnBorders withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Id</Table.Th>
                  <Table.Th>Serial Number</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Buy</Table.Th>
                  <Table.Th>Sell</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.row.original.items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.id}</Table.Td>
                    <Table.Td>{item.serialNumber}</Table.Td>
                    <Table.Td>{item.name}</Table.Td>
                    <Table.Td>{item.description}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </TableScrollContainer>
        </Box>
      );
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
            deleteProduct(data.row.original.id).then((data) => {
              if (data) {
                notifications.show({
                  message: "Product has been deleted",
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
          <ProductFrom />
        </Flex>

        <MantineReactTable table={table} />
      </Box>
    </Suspense>
  );
}
const columns: MRT_ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "barcode",
    header: "BarCode",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];
