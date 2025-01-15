"use client";
import { getInvoices } from "@/services/invoice-service";
import {
  closeSale,
  deleteSale,
  getSales,
  updateSalePayments,
} from "@/services/sale-service";
import type { Customer, Invoice, Sale } from "@/types";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  LoadingOverlay,
  MenuItem,
  Modal,
  NumberFormatter,
  NumberInput,
  Select,
  Table,
  TableScrollContainer,
  Text,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

export default function InvoiceTable(props: { customers: Customer[] }) {
  const [data, setData] = useState<Invoice[]>([]);

  const [date, setDate] = useState<Date[]>([
    dayjs().startOf("D").toDate(),
    dayjs().endOf("D").toDate(),
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>();

  const [isPending, setTranstion] = useTransition();

  const table = useMantineReactTable({
    columns,
    data: data,

    mantineLoadingOverlayProps: {
      visible: isPending,
    },
    enableRowActions: true,
    renderRowActionMenuItems: (data) => [
      data.row.original.type === "waiting" ? (
        <MenuItem
          ta={"center"}
          key={1}
          onClick={() => {
            route.push(
              "/dashboard/sale-history?open-edit=true&" +
                "id=" +
                data.row.original.id
            );
          }}
        >
          Edit
        </MenuItem>
      ) : (
        <MenuItem
          ta={"center"}
          key={2}
          onClick={() => {
            route.push(
              "/dashboard/sale-history?open=true&" +
                "id=" +
                data.row.original.id
            );
          }}
        >
          Add Payment
        </MenuItem>
      ),
      <MenuItem
        ta={"center"}
        key={0}
        onClick={() => {
          const password = prompt("Enter your password to delete this sale");
          if (!password) {
            return;
          }
          if (password === "365272") {
            if (confirm("Are you sure you want to delete this sale")) {
              setTranstion(() => {
                deleteSale(data.row.original.id).then(() => {
                  notifications.show({
                    message: "Sale Deleted",
                  });
                  getData();
                });
              });
            }
          } else {
            alert("Invalid Password");
          }
        }}
      >
        Delete
      </MenuItem>,
      <MenuItem
        key={3}
        ta={"center"}
        onClick={() => {
          const password = prompt("Enter your password to delete this sale");
          if (!password) {
            return;
          }
          if (password === "365272") {
            if (confirm("Are you sure you want to close this sale")) {
              setTranstion(() => {
                closeSale(data.row.original.id);
                notifications.show({
                  message: "Sale Closed",
                });
                getData();
              });
            }
          } else {
            alert("Invalid Password");
          }
        }}
      >
        Close
      </MenuItem>,
    ],
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

  //   const remaining = useMemo(() => {
  //     return (
  //       (selectedSale?.saleItems.reduce(
  //         (prv, cur) => prv + cur.price * cur.quantity,
  //         0
  //       ) ?? 0) -
  //       (selectedSale?.salePayments.reduce((prv, cur) => cur.amount + prv, 0) ??
  //         0)
  //     );
  //   }, [selectedSale]);

  //   const amounts = useMemo(() => {
  //     let cashIn = 0;
  //     let credit = 0;
  //     let unPaid = 0;
  //     let expensive = 0;
  //     let returns = 0;

  //     data.forEach((sale) => {
  //       if (sale.type === "cash") {
  //         cashIn += sale.total;
  //       } else if (sale.type === "credit") {
  //         credit += sale.salePayments.reduce((prev, cur) => prev + cur.amount, 0);
  //         unPaid =
  //           sale.saleItems.reduce(
  //             (prev, cur) => prev + cur.price * cur.quantity,
  //             0
  //           ) - credit;
  //       } else if (sale.type === "return") {
  //         returns += sale.saleItems.reduce(
  //           (prev, cur) => prev + cur.price * cur.quantity,
  //           0
  //         );
  //       } else if (sale.type === "expensive") {
  //         expensive += sale.saleItems.reduce(
  //           (prev, cur) => prev + cur.price * cur.quantity,
  //           0
  //         );
  //       }
  //     });

  //     const total = cashIn + credit - returns - expensive - unPaid;
  //     return { cashIn, credit, total, returns, unPaid, expensive };
  //   }, [data]);

  const customers = useMemo(() => {
    return props.customers.map((customer) => ({
      value: customer.id.toString(),
      label: customer.name,
    }));
  }, [props.customers]);
  const [amount, setAmount] = useState(0);
  const handleSubmit = useCallback(
    (e: number) => {
      if (e) {
        setTranstion(() => {
          const id = searchParams.get("id")!;

          updateSalePayments(+id, e).then((data) => {
            if (data) {
              notifications.show({
                message: data.message,
              });
              setAmount(0);
              route.replace("/dashboard/sale-history");
            }
          });
        });
      }
    },
    [route, searchParams]
  );
  const getData = useCallback(() => {
    setTranstion(() => {
      getInvoices({
        customerId: selectedCustomer ? +selectedCustomer : undefined,
        fromDate: date[0],
        type: selectedType,
        toDate: date[1],
      }).then((data) => {
        setData(data);
      });
    });
  }, [selectedCustomer, date, selectedType]);

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

        <Checkbox
          label="All Dates"
          onChange={(e) => {
            if (!e.target.checked) {
              setDate([
                dayjs().startOf("D").toDate(),
                dayjs().endOf("D").toDate(),
              ]);
            } else {
              setDate([]);
            }
          }}
        />
        <Select
          data={["debit", "credit"]}
          placeholder="Type"
          searchable
          clearable
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e ?? undefined);
          }}
        />
        <Select
          data={customers}
          placeholder="All"
          searchable
          clearable
          value={selectedCustomer ?? ""}
          onChange={(e) => {
            setSelectedCustomer(e ?? undefined);
          }}
        />
        <Button onClick={getData} loading={isPending}>
          Search
        </Button>
      </Flex>

      {/* <Flex justify={"space-around"} gap={5} mb={6}>
        <Card w={"100%"}>
          <Title size={"lg"}>Income</Title>
          <div>
            $
            <NumberFormatter
              thousandSeparator=","
              value={amounts.cashIn + amounts.credit}
            />
          </div>
        </Card>

        <Card w={"100%"}>
          <Title size={"lg"}>Unpaid</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.unPaid} />
          </div>
        </Card>
        <Card w={"100%"}>
          <Title size={"lg"}>Expensive</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.expensive} />
          </div>
        </Card>

        <Card w={"100%"}>
          <Title size={"lg"}>Return</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.returns} />
          </div>
        </Card>

        <Card w={"100%"}>
          <Title size={"lg"}>Total</Title>
          <div>
            $<NumberFormatter thousandSeparator="," value={amounts.total} />
          </div>
        </Card>
      </Flex> */}

      {/* <Modal
        title={`Sale History ${selectedSale?.id} `}
        opened={searchParams.get("open") ? true : false}
        onClose={() => {
          route.replace("/dashboard/sale-history");
          setAmount(0);
        }}
      >
        <Modal.Body>
          {remaining > 0 ? (
            <Box
              component="form"
              display={"flex"}
              style={{
                gap: 5,
                flexDirection: "column",
              }}
              onSubmit={(e) => {
                e.preventDefault();

                if (amount === 0) {
                  return;
                }
                handleSubmit(amount);
              }}
            >
              <Text>Invoice Id: {selectedSale?.invoiceId}</Text>
              <Text>For: {selectedSale?.customer?.name}</Text>
              <Text>Created At: {selectedSale?.createdAt.toDateString()}</Text>
              <Text>Note: {selectedSale?.note}</Text>
              <Text>
                Remaining: $
                <NumberFormatter value={remaining} />
              </Text>
              <Text>
                Remaining: ل.ل
                <NumberFormatter value={remaining} />
              </Text>
              <NumberInput
                label="Paid"
                min={0}
                thousandSeparator
                max={remaining}
                value={amount}
                onChange={(e) => {
                  setAmount(e ? +e : 0);
                }}
              />
              <Button type="submit" loading={isPending}>
                Save
              </Button>
            </Box>
          ) : (
            <Text>Already Paid</Text>
          )}
        </Modal.Body>
      </Modal> */}
      <MantineReactTable table={table} />
    </Box>
  );
}

const columns: MRT_ColumnDef<Invoice>[] = [
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
      return dayjs(originalRow.createdAt).format("DD-MM-YYYY");
    },
    header: "Date",
  },
];
