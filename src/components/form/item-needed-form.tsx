"use client";
import { getItem } from "@/services/item-service";
import {
  createItemNeeded,
  getItemNeeded,
  updateItemNeeded,
} from "@/services/items-needed-service";
import type { Item } from "@/types";
import ItemNeededValidator from "@/validator/item-needed-validator";
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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

export default function ItemNeededFrom(props: { items: Item[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { setValue, handleSubmit, control, setError, reset } =
    useForm<ItemNeededValidator>({
      resolver: zodResolver(ItemNeededValidator),
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
          getItemNeeded(+id).then((data) => {
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
    (data: ItemNeededValidator) => {
      setTranstions(() => {
        if (id == "new") {
          createItemNeeded(data).then((response) => {
            router.refresh();

            onClose();
            notifications.show({
              message: response.message,
              color: "green",
            });
          });
        } else {
          const numberId = id ? parseInt(id) : 0;
          updateItemNeeded(numberId, data).then((response) => {
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
    [id, router, onClose]
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
                name={"note"}
                control={control}
                render={({ field, fieldState }) => (
                  <Textarea
                    label="Note"
                    withAsterisk
                    error={fieldState.error?.message}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name={"quantity"}
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    error={fieldState.error?.message}
                    label="Quantity"
                    value={field.value}
                    onChange={field.onChange}
                    withAsterisk
                    thousandSeparator
                  />
                )}
              />

              <Controller
                name={"itemId"}
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    error={fieldState.error?.message}
                    label="Item"
                    withAsterisk
                    value={field.value?.toString() ?? ""}
                    onChange={(e) => {
                      if (e) {
                        field.onChange(+e);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    data={props.items?.map((res) => ({
                      label: res.name,
                      value: res.id.toString(),
                    }))}
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
