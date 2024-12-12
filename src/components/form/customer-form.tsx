"use client";
import {
  createCustomer,
  getCustomer,
  updateCustomer,
} from "@/services/customer-service";
import CustomerValidator from "@/validator/customer-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Customer } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

export default function CustomerFrom() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setValue, handleSubmit, control, setError, reset } =
    useForm<CustomerValidator>({
      resolver: zodResolver(CustomerValidator),
    });
  const isOpen = params.get("open") ? true : false;
  const onClose = useCallback(() => {
    const searchParams = new URLSearchParams(params.toString());
    searchParams.delete("open");
    reset();
    searchParams.delete("id");
    router.push(pathname + "?" + searchParams.toString());
  }, [params, pathname, router, reset]);

  const id = params.get("id");
  const [isPending, setTranstions] = useTransition();

  useEffect(() => {
    if (id) {
      if (id !== "new") {
        setTranstions(() => {
          getCustomer(+id).then((data) => {
            if (data) {
              Object.keys(data).forEach((key) => {
                if (key === "name" || key == "phone" || key == "address") {
                  const keyData = key as keyof Customer;
                  setValue(key, data[keyData] as unknown as string);
                }
              });
            }
          });
        });
      }
    }
  }, [id, setValue]);
  const onSubmit = useCallback(
    (data: CustomerValidator) => {
      setTranstions(() => {
        if (id == "new") {
          createCustomer(data).then((response) => {
            if (response.error) {
              setError(response.error.key as any, {
                message: response.error.message,
                type: "manual",
              });
            } else {
              router.refresh();

              onClose();
              notifications.show({
                message: response.message,
                color: "green",
              });
            }
          });
        } else {
          const numberId = id ? parseInt(id) : 0;
          updateCustomer(numberId, data).then((response) => {
            if (response.error) {
              notifications.show({
                message: response.error.message,
                color: "red",
              });
            } else {
              router.refresh();

              onClose();
              notifications.show({
                message: response.message,
                color: "green",
              });
            }
          });
        }
      });
    },
    [id, setError, router, onClose]
  );

  return (
    <>
      <Flex align={"end"} justify={"end"} mb={5}>
        <ActionIcon
          onClick={() => {
            const searchParams = new URLSearchParams(params.toString());
            searchParams.set("open", "true");
            searchParams.set("id", "new");
            router.push(pathname + "?" + searchParams.toString());
          }}
        >
          <IconPlus />
        </ActionIcon>
      </Flex>

      <Modal
        title="Customer Form"
        opened={isOpen}
        onClose={onClose}
        size={"sm"}
      >
        <Modal.Body>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Controller
                name={"name"}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Name"
                    withAsterisk
                    error={fieldState.error?.message}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name={"phone"}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    error={fieldState.error?.message}
                    label="Phone"
                    withAsterisk
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name={"address"}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    error={fieldState.error?.message}
                    label="Address"
                    withAsterisk
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />

              <Button type="submit" loading={isPending}>
                Save
              </Button>
            </Stack>
          </Box>
        </Modal.Body>
      </Modal>
    </>
  );
}
