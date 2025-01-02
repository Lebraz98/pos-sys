"use client";
import { deleteRate } from "@/services/rate-service";
import type { Rate } from "@/types";
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
import RateFrom from "../form/rate-form";

export default function RateTable(props: { data: Rate[] }) {
  const route = useRouter();

  const [isPending, setTranstions] = useTransition();

  const onEdit = useCallback(
    (id: number) => {
      route.push("/dashboard/rate?open=true&id=" + id);
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
            deleteRate(data.row.original.id).then((data) => {
              if (data) {
                notifications.show({
                  message: "Rate has been deleted",
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
          <RateFrom />
        </Flex>

        <MantineReactTable table={table} />
      </Box>
    </Suspense>
  );
}
const columns: MRT_ColumnDef<Rate>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "value",
    header: "Value",
    Cell(props) {
      return (
        <span>
          <NumberFormatter
            value={props.row.original.value}
            thousandSeparator={true}
            prefix={"L.L"}
          />
        </span>
      );
    },
  },
];
