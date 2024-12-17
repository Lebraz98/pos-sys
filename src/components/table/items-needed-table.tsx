"use client";
import { deleteProduct } from "@/services/product-service";
import type { Item, ItemNeeded } from "@/types";
import { Box, Flex, LoadingOverlay, MenuItem, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconX } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useTransition } from "react";
import ItemNeededFrom from "../form/item-needed-form";
import { deleteItemNeeded } from "@/services/items-needed-service";

export default function ItemsNeededTable(props: {
  data: ItemNeeded[];
  items: Item[];
}) {
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/items-needed?open=true&id=" + id);
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
    renderDetailPanel(props) {
      return <Text>{props.row.original.note}</Text>;
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
            deleteItemNeeded(data.row.original.id).then((data) => {
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
          <ItemNeededFrom items={props.items} />
        </Flex>

        <MantineReactTable table={table} />
      </Box>
    </Suspense>
  );
}
const columns: MRT_ColumnDef<ItemNeeded>[] = [
  {
    accessorKey: "item.serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },

  {
    accessorKey: "item.name",
    header: "Item  Name",
  },
  {
    accessorKey: "note",
    header: "Note",
  },
  {
    accessorKey: "item.product.name",
    header: "Product Name",
  },
];
