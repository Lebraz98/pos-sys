"use client";
import { createRate, getRate, updateRate } from "@/services/rate-service";
import RateValidator from "@/validator/rate-validator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  Modal,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { Rate } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

export default function RateFrom() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setValue, handleSubmit, control, setError, reset } =
    useForm<RateValidator>({
      resolver: zodResolver(RateValidator),
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
          getRate(+id).then((data) => {
            if (data) {
              setValue("value", data.value);
            }
          });
        });
      }
    }
  }, [id, setValue]);
  const onSubmit = useCallback(
    (data: RateValidator) => {
      setTranstions(() => {
        if (id == "new") {
          createRate(data).then((response) => {
            router.refresh();

            onClose();
            notifications.show({
              message: response.message,
              color: "green",
            });
          });
        } else {
          const numberId = id ? parseInt(id) : 0;
          updateRate(numberId, data).then((response) => {
            router.refresh();

            onClose();
            notifications.show({
              message: response.message,
              color: "green",
            });
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

      <Modal title="Rate Form" opened={isOpen} onClose={onClose} size={"sm"}>
        <Modal.Body>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Controller
                name={"value"}
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    error={fieldState.error?.message}
                    label="Value"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    thousandSeparator
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
