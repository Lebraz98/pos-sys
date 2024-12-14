"use client";
import { createItem, getItem, updateItem } from "@/services/item-service";
import ItemValidator from "@/validator/item-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  Modal,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Item, Product } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

export default function ItemFrom(props: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { setValue, handleSubmit, control, setError, reset } =
    useForm<ItemValidator>({
      resolver: zodResolver(ItemValidator),
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
          getItem(+id).then((data) => {
            if (data) {
              Object.keys(data).forEach((key) => {
                const keyData = key as keyof Item;
                setValue(key as any, data[keyData] as unknown as string);
              });
            }
          });
        });
      }
    }
  }, [id, setValue]);

  useEffect(() => {
    if (id) {
      if (id !== "new") {
        setTranstions(() => {
          getItem(+id).then((data) => {
            if (data) {
              Object.keys(data).forEach((key) => {
                const keyData = key as keyof Item;
                setValue(key as any, data[keyData] as unknown as string);
              });
            }
          });
        });
      }
    }
  }, [id, setValue]);
  const onSubmit = useCallback(
    (data: ItemValidator) => {
      setTranstions(() => {
        if (id == "new") {
          createItem(data).then((response) => {
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
          updateItem(numberId, data).then((response) => {
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
        <Button
          onClick={() => {
            const searchParams = new URLSearchParams(params.toString());
            searchParams.set("open", "true");
            searchParams.set("id", "new");
            router.push(pathname + "?" + searchParams.toString());
          }}
        >
          <IconPlus />
        </Button>
      </Flex>

      <Modal title="Item Form" opened={isOpen} onClose={onClose} size={"sm"}>
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
                name={"buy"}
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    error={fieldState.error?.message}
                    label="Buy Price"
                    value={field.value}
                    onChange={field.onChange}
                    withAsterisk
                  />
                )}
              />
              <Controller
                name={"sell"}
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    error={fieldState.error?.message}
                    label="Sell Price"
                    value={field.value}
                    onChange={field.onChange}
                    withAsterisk
                  />
                )}
              />
              <Controller
                name={"productId"}
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    error={fieldState.error?.message}
                    label="Products"
                    withAsterisk
                    value={field.value?.toString() ?? ""}
                    onChange={(e) => {
                      if (e) {
                        field.onChange(+e);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    data={props.products?.map((res) => ({
                      label: res.name,
                      value: res.id.toString(),
                    }))}
                  />
                )}
              />

              <Controller
                name={"serialNumber"}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    error={fieldState.error?.message}
                    label="Serial Number"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name={"description"}
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    label="Description"
                    error={fieldState.error?.message}
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
