"use client";
import {
  createInvoice,
  getInvoice,
  getInvoices,
  updateInvoice,
} from "@/services/invoice-service";
import {
  getInvoiceWithJsonData,
  serlizeInvoiceData,
  type Customer,
  type Invoice,
} from "@/types";
import InvoiceValidator from "@/validator/invoice-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Flex,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconClearAll, IconPlus, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

export default function InvoiceForm(props: {
  customers: Customer[];
  onUpdate: () => void;
}) {
  const customers = useMemo(
    () =>
      props.customers.map((customer) => ({
        label: customer.name,
        value: customer.id.toString(),
      })),
    [props.customers]
  );
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);
  const { push, replace } = useRouter();
  const [isPending, setTranstion] = useTransition();
  const form = useForm<InvoiceValidator>({
    resolver: zodResolver(InvoiceValidator),
  });

  useEffect(() => {
    if (searchParams.get("form") === "true" && id) {
      setTranstion(() => {
        getInvoice(+id!).then((data) => {
          form.reset(data as any);
        });
      });
    }

    return () => {
      form.reset({});
    };
  }, [form, id, searchParams]);

  const handleSubmit = useCallback(
    (data: InvoiceValidator) => {
      setTranstion(() => {
        if (id) {
          setTranstion(() => {
            updateInvoice(+id, data).then(() => {
              props.onUpdate();

              notifications.show({
                message: "Invoice updated successfully",
              });

              replace("/dashboard/invoices");
            });
          });
        } else {
          setTranstion(() => {
            createInvoice(data).then(() => {
              notifications.show({
                message: "Invoice created successfully",
              });

              props.onUpdate();

              replace("/dashboard/invoices");
            });
          });
        }
      });
    },
    [id, props, replace]
  );
  const watch = useWatch({ control: form.control });
  const jsonData = useMemo(() => serlizeInvoiceData(watch.data), [watch.data]);
  useEffect(() => {
    let total = 0;
    jsonData?.forEach((data) => {
      total += data.price * data.quantity;
    });
    form.setValue("amount", total === 0 ? watch.amount ?? 0 : total);
  }, [form, jsonData, watch.amount]);

  return (
    <>
      <Button
        onClick={() => {
          push("/dashboard/invoices?form=true");
        }}
      >
        Create Invoice
      </Button>

      <Modal
        title={id?.toString() ? "Edit Invoice" : "Create Invoice"}
        opened={searchParams.get("form") === "true"}
        onClose={() => replace("/dashboard/invoices")}
        size={"xl"}
      >
        <Modal.Body>
          <Stack
            component={"form"}
            gap="md"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <TextInput
                  label="Title"
                  withAsterisk
                  placeholder="Enter title"
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value)}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Textarea
                  label="Description"
                  placeholder="Enter description"
                  resize="vertical"
                  withAsterisk
                  minLength={5}
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value)}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="note"
              render={({ field, fieldState }) => (
                <Textarea
                  label="Note"
                  placeholder="Enter Note"
                  resize="vertical"
                  minLength={5}
                  value={field.value ?? ""}
                  onChange={(value) => field.onChange(value)}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Select
                  withAsterisk
                  data={[
                    { label: "Debit", value: "debit" },
                    { label: "Credit", value: "credit" },
                  ]}
                  value={field.value}
                  label="Type"
                  placeholder="Select type"
                  error={fieldState.error?.message}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <DateInput
                  withAsterisk
                  label="Date"
                  placeholder="Select date"
                  valueFormat="DD/MM/YYYY"
                  value={field.value ? dayjs(field.value).toDate() : null}
                  error={fieldState.error?.message}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />
            <Controller
              control={form.control}
              name="customerId"
              render={({ field, fieldState }) => (
                <Select
                  data={customers}
                  withAsterisk
                  value={field.value?.toString() ?? null}
                  label="Customer"
                  placeholder="Select customer"
                  error={fieldState.error?.message}
                  searchable
                  onChange={(value) => {
                    if (value) {
                      const customer = props.customers.find(
                        (customer) => customer.id === +value
                      )!;
                      form.setValue("customerId", customer?.id);
                    } else {
                      form.resetField("customerId");
                    }
                  }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <NumberInput
                  disabled={(jsonData?.length ?? 0) > 0}
                  label="Amount"
                  placeholder="Enter amount"
                  value={field.value}
                  min={0}
                  withAsterisk
                  onChange={(value) => field.onChange(value)}
                  error={fieldState.error?.message}
                  thousandSeparator
                  startValue={0}
                  leftSection="$"
                />
              )}
            />
            <Controller
              control={form.control}
              name="data"
              render={({ field, fieldState }) => (
                <>
                  <Flex justify={"space-between"} align={"center"}>
                    <Text>Items</Text>
                    <ActionIcon
                      onClick={() => {
                        field.onChange(
                          JSON.stringify(
                            jsonData?.concat({
                              title: "",
                              price: 0,
                              quantity: 0,
                            }) ?? []
                          )
                        );
                      }}
                    >
                      <IconPlus />
                    </ActionIcon>
                  </Flex>
                  {jsonData?.map((data, index) => (
                    <Flex
                      key={index}
                      gap="md"
                      justify={"space-between"}
                      align={"end"}
                    >
                      <ActionIcon
                        onClick={() => {
                          jsonData.splice(index, 1);
                          field.onChange(JSON.stringify(jsonData));
                        }}
                        color="red"
                      >
                        <IconX />
                      </ActionIcon>
                      <TextInput
                        label="Title"
                        placeholder="Enter title"
                        defaultValue={data.title}
                        onBlur={(value) => {
                          jsonData[index].title = value.target.value;
                          field.onChange(JSON.stringify(jsonData));
                        }}
                      />
                      <NumberInput
                        label="Price"
                        placeholder="Enter price"
                        defaultValue={data.price}
                        onBlur={(value) => {
                          jsonData[index].price = value
                            ? parseFloat(value.target.value)
                            : 0;
                          field.onChange(JSON.stringify(jsonData));
                          console.log(jsonData);
                        }}
                        thousandSeparator
                        leftSection="$"
                      />
                      <NumberInput
                        label="Quantity"
                        placeholder="Enter quantity"
                        defaultValue={data.quantity}
                        onBlur={(value) => {
                          jsonData[index].quantity = value
                            ? parseFloat(value.target.value)
                            : 0;
                          field.onChange(JSON.stringify(jsonData));
                        }}
                      />
                    </Flex>
                  ))}
                </>
              )}
            />
            <Button type="submit" loading={isPending}>
              {id?.toString() ? "Update Invoice" : "Create Invoice"}
            </Button>
          </Stack>
        </Modal.Body>
      </Modal>
    </>
  );
}
