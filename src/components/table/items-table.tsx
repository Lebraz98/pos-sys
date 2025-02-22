"use client";
import { deleteItem } from "@/services/item-service";
import type { Item, Product } from "@/types";
import {
  Box,
  Flex,
  LoadingOverlay,
  MenuItem,
  Modal,
  NumberFormatter,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconPrinter, IconX } from "@tabler/icons-react";

import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState, useTransition } from "react";
import ItemFrom from "../form/item-form";
import { useDisclosure } from "@mantine/hooks";
import ItemPdfView from "../view/item-pdf";

export default function ItemTable(props: {
  data: Item[];
  rate: number;
  products: Product[];
}) {
  const route = useRouter();
  const [opened, { open, close }] = useDisclosure(false);

  const [isPending, setTranstions] = useTransition();
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/items?open=true&id=" + id);
    },
    [route]
  );
  const columns: MRT_ColumnDef<Item>[] = useMemo(
    () => [
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
              <NumberFormatter
                value={props.row.original.buy}
                thousandSeparator
              />
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
        id: "sell-lbp",
        header: "Sell in ل.ل",
        Cell(data) {
          return (
            <span style={{ color: "green" }}>
              ل.ل
              <NumberFormatter
                value={data.row.original.sell * +props.rate}
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
    ],
    [props.rate]
  );
  const table = useMantineReactTable({
    columns,
    data: props.data,
    initialState: {
      showColumnFilters: true,
      pagination: {
        pageSize: 100,
        pageIndex: 0,
      },
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
            deleteItem(data.row.original.id).then((data) => {
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
      <MenuItem
        color="blue"
        key={5}
        onClick={() => {
          setSelectedItem(data.row.original);
          open();
        }}
      >
        <IconPrinter />
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
        <Modal opened={opened} onClose={close} title={selectedItem?.name}>
          <ItemPdfView item={selectedItem}  rate={props.rate}/>
        </Modal>
        <MantineReactTable table={table} />
      </Box>
    </Suspense>
  );
}
