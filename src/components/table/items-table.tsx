"use client";
import { deleteProduct } from "@/services/product-service";
import type { Item, Product } from "@/types";
import {
  Box,
  Flex,
  LoadingOverlay,
  MenuItem,
  NumberFormatter,
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
import ItemFrom from "../form/item-form";

export default function ItemTable(props: {
  data: Item[];
  products: Product[];
}) {
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/items?open=true&id=" + id);
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
          <ItemFrom products={props.products} />
        </Flex>

        <MantineReactTable table={table} />
      </Box>
    </Suspense>
  );
}
const columns: MRT_ColumnDef<Item>[] = [
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "product.name",
    header: "Product Name",
  },
  {
    accessorKey: "buy",
    header: "Buy",
    Cell(props) {
      return (
        <span style={{ color: "red" }}>
          $
          <NumberFormatter value={props.row.original.buy} thousandSeparator />
        </span>
      );
    },
  },
  {
    accessorKey: "sell",
    header: "Sell",
    Cell(props) {
      return (
        <span style={{ color: "green" }}>
          $
          <NumberFormatter
            value={props.row.original.sell}
            thousandSeparator=","
          />
        </span>
      );
    },
  },
  {
    header: "Win",
    accessorFn(originalRow) {
      return originalRow.sell - originalRow.buy;
    },
    Cell(props) {
      return (
        <span style={{ color: "orange" }}>
          $
          <NumberFormatter
            value={props.row.original.sell - props.row.original.buy}
            thousandSeparator=","
          />
        </span>
      );
    },
  },
];
