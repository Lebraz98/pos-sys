"use client";
import { deleteSale } from "@/services/sale-service";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  NumberInput,
  Table,
  TableScrollContainer,
  Text,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import type { Prisma } from "@prisma/client";
import { IconPlus, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

export default function SalesTable(props: {
  data: Prisma.SaleGetPayload<{
    include: {
      customer: true;
      saleItems: {
        include: {
          item: {
            include: {
              product: true;
            };
          };
        };
      };
      salePayments: true;
    };
  }>[];
}) {
  const [date, setDate] = useState<Date[]>([
    dayjs().startOf("D").toDate(),
    dayjs().endOf("D").toDate(),
  ]);
  const data = useMemo(() => {
    return props.data.filter(
      (sale) => sale.createdAt >= date[0] && sale.createdAt <= date[1]
    );
  }, [date, props.data]);

  const [isPeding, setTranstion] = useTransition();

  const table = useMantineReactTable({
    columns,
    data: data,
    renderDetailPanel(props) {
      const total = props.row.original.saleItems.reduce(
        (prev, cur) => cur.price * cur.quantity + prev,
        0
      );
      const totalPaid = props.row.original.salePayments.reduce(
        (prev, cur) => cur.amount + prev,
        0
      );
      return (
        <Box>
          <LoadingOverlay visible={isPeding} />
          <Box maw={300} bd={1} mb={5}>
            <Text>
              Amout: $
              <NumberFormatter value={total} />
            </Text>

            <Text>
              Paid: $
              <NumberFormatter value={totalPaid} />
            </Text>
            <Divider />
            <Text>
              Total: $
              <NumberFormatter value={total - totalPaid} />
            </Text>

            <Text>Status: {total - totalPaid === 0 ? "Paid" : "Unpaid"}</Text>
          </Box>

          <TableScrollContainer minWidth={"100%"}>
            <Table withColumnBorders withTableBorder withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Serial Number</Table.Th>

                  <Table.Th>Item Name</Table.Th>
                  <Table.Th>Product Name</Table.Th>
                  <Table.Th>Note</Table.Th>

                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {props.row.original.saleItems.map((saleItem) => (
                  <Table.Tr key={saleItem.id}>
                    <Table.Td>{saleItem.item?.serialNumber}</Table.Td>
                    <Table.Td>{saleItem.item?.name}</Table.Td>
                    <Table.Td>{saleItem.item?.product.name}</Table.Td>
                    <Table.Td>{saleItem.note}</Table.Td>

                    <Table.Td>{saleItem.quantity}</Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={saleItem.price}
                        thousandSeparator=","
                      />
                    </Table.Td>
                    <Table.Td>
                      $
                      <NumberFormatter
                        value={saleItem.total}
                        thousandSeparator=","
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </TableScrollContainer>
        </Box>
      );
    },
    enableRowActions: true,
    renderRowActions(props) {
      return (
        <Flex gap={5}>
          <ActionIcon
            color="red"
            onClick={() => {
              const password = prompt(
                "Enter your password to delete this sale"
              );
              if (!password) {
                return;
              }
              if (password === "365272") {
                if (confirm("Are you sure you want to delete this sale")) {
                  setTranstion(() => {
                    deleteSale(props.row.original.id);
                    notifications.show({
                      message: "Sale Deleted",
                    });
                  });
                }
              } else {
                alert("Invalid Password");
              }
            }}
          >
            <IconX />
          </ActionIcon>
          <ActionIcon
            onClick={() => {
              route.push(
                "/dashboard/sale-history?open=true&" +
                  "id=" +
                  props.row.original.id
              );
            }}
          >
            <IconPlus />{" "}
          </ActionIcon>
        </Flex>
      );
    },
  });

  const searchParams = useSearchParams();
  const route = useRouter();
  const selectedSale = useMemo(() => {
    const id = searchParams.get("id");
    if (!id) {
      return null;
    }
    return data.find((sale) => sale.id === +id);
  }, [searchParams, data]);

  const remaining = useMemo(() => {
    return (
      (selectedSale?.saleItems.reduce(
        (prv, cur) => prv + cur.price * cur.quantity,
        0
      ) ?? 0) -
      (selectedSale?.salePayments.reduce((prv, cur) => cur.amount + prv, 0) ??
        0)
    );
  }, [selectedSale]);

  const amounts = useMemo(() => {
    const cashIn = data.reduce(
      (prev, cur) =>
        cur.salePayments.reduce(
          (prev, cur) => (cur.type === "CASH" ? cur.amount + prev : prev),
          0
        ) + prev,
      0
    );
    const credit = data.reduce(
      (prev, cur) =>
        cur.salePayments.reduce(
          (prev, cur) => (cur.type === "CREDIT" ? cur.amount + prev : prev),
          0
        ) + prev,
      0
    );
    const total = cashIn + credit;
    return { cashIn, credit, total };
  }, [data]);

  return (
    <Box p={6}>
      <Flex gap={10} mb={5}>
        <DateInput
          value={date[0]}
          onChange={(e) => {
            setDate([dayjs(e).startOf("D").toDate(), date[1]]);
          }}
        />
        <DateInput
          value={date[1]}
          onChange={(e) => {
            setDate([date[0], dayjs(e).endOf("D").toDate()]);
          }}
        />
      </Flex>

      <Flex justify={"space-around"} gap={5} mb={6}>
        <Card w={"100%"}>
          <Title size={"lg"}>Cash In</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.cashIn} />
          </div>
        </Card>

        <Card w={"100%"}>
          <Title size={"lg"}>Credit</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.credit} />
          </div>
        </Card>

        <Card w={"100%"}>
          <Title size={"lg"}>Total</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.total} />
          </div>{" "}
        </Card>
      </Flex>
      <Modal
        title={`Sale History ${selectedSale?.id} `}
        opened={searchParams.get("open") ? true : false}
        onClose={() => {
          route.replace("/dashboard/sale-history");
        }}
      >
        <Modal.Body>
          {remaining > 0 ? (
            <Box component="form">
              <Text>Invoice Id: {selectedSale?.invoiceId}</Text>
              <Text>For: {selectedSale?.customer.name}</Text>
              <Text>Created At: {selectedSale?.createdAt.toDateString()}</Text>
              <Text>Note: {selectedSale?.note}</Text>
              <Text>
                Remaining: $
                <NumberFormatter value={remaining} />
              </Text>
              <NumberInput label="Paid" min={0} />
              <Button type="submit">Save</Button>
            </Box>
          ) : (
            <Text>Already Paid</Text>
          )}
        </Modal.Body>
      </Modal>
      <MantineReactTable table={table} />
    </Box>
  );
}

const columns: MRT_ColumnDef<
  Prisma.SaleGetPayload<{
    include: {
      customer: true;
      saleItems: {
        include: {
          item: { include: { product: true } };
        };
      };
      salePayments: true;
    };
  }>
>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "invoiceId",
    header: "Invoice Id",
  },
  {
    accessorKey: "note",
    header: "Note",
  },
  {
    accessorKey: "customer.name",
    header: "Customer Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "type",
    header: "Type",
  },

  {
    accessorFn(originalRow) {
      const total = originalRow.saleItems.reduce(
        (prev, cur) => cur.price * cur.quantity + prev,
        0
      );
      return (
        <div>
          $<NumberFormatter value={total} thousandSeparator="," />
        </div>
      );
    },
    accessorKey: "saleItems.total",
    header: "Total",
  },
  {
    accessorFn(originalRow) {
      return dayjs(originalRow.createdAt).format("DD-MM-YYYY");
    },
    header: "Date",
  },
];