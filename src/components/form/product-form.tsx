"use client";
import {
  createProduct,
  getProduct,
  updateProduct,
} from "@/services/product-service";
import ProductValidator from "@/validator/product-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Modal,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Product } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

export default function ProductFrom() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setValue, handleSubmit, control, setError, reset } =
    useForm<ProductValidator>({
      resolver: zodResolver(ProductValidator),
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
          getProduct(+id).then((data) => {
            if (data) {
              Object.keys(data).forEach((key) => {
                if (
                  key === "name" ||
                  key === "barcode" ||
                  key === "description"
                ) {
                  const keyData = key as keyof Product;
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
    (data: ProductValidator) => {
      setTranstions(() => {
        if (id == "new") {
          createProduct(data).then((response) => {
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
          updateProduct(numberId, data).then((response) => {
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

      <Modal title="Product Form" opened={isOpen} onClose={onClose} size={"sm"}>
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
                name={"barcode"}
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    error={fieldState.error?.message}
                    label="Barcode"
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
