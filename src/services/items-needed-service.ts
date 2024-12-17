"use server";

import prisma from "@/prisma/prisma";
import type ItemNeededValidator from "@/validator/item-needed-validator";
import { revalidatePath } from "next/cache";

export async function getItemNeededs() {
  return prisma.itemNeeded.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      item: {
        include: {
          product: true,
        },
      },
    },
  });
}
export async function getItemNeeded(id: number) {
  return prisma.itemNeeded.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createItemNeeded(data: ItemNeededValidator) {
  await prisma.itemNeeded.create({
    data: data,
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Item Needed created successfully",
  };
}

export async function updateItemNeeded(id: number, data: ItemNeededValidator) {
  const isItemNeededExist = await prisma.itemNeeded.findUnique({
    where: {
      id: id,
    },
  });

  if (!isItemNeededExist) {
    return {
      error: {
        key: "id",
        message: "Item Needed not found",
      },
    };
  }
  await prisma.itemNeeded.update({
    where: {
      id: id,
    },
    data: data,
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Item Needed updated successfully",
  };
}

export async function deleteItemNeeded(id: number) {
  const isItemNeededExist = await prisma.itemNeeded.findUnique({
    where: {
      id: id,
    },
  });

  if (!isItemNeededExist) {
    return {
      error: {
        key: "id",
        message: "Item Needed not found",
      },
    };
  }
  await prisma.itemNeeded.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Item Needed deleted successfully",
  };
}
