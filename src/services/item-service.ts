"use server";

import prisma from "@/prisma/prisma";
import type ItemValidator from "@/validator/item-validator";
import { revalidatePath } from "next/cache";

export async function getItems() {
  return prisma.item.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      product: true,
    },
  });
}
export async function getItem(id: number) {
  return prisma.item.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createItem(data: ItemValidator) {
  const isItemExist = await prisma.item.findFirst({
    where: {
      OR: [
        {
          name: data.name,
        },
        {
          serialNumber: data.serialNumber,
        },
      ],
    },
  });

  if (isItemExist) {
    if (isItemExist?.name == data.name) {
      return {
        error: {
          key: "name",
          message: "Item name already exist",
        },
      };
    } else if (isItemExist?.serialNumber == data.serialNumber) {
      return {
        error: {
          key: "serialNumber",
          message: "Item serialNumber already exist",
        },
      };
    }
  } else {
    await prisma.item.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        description: data.description,
        buy: data.buy,
        sell: data.sell,
        productId: data.productId,
      },
    });
  }
  revalidatePath("/dashboard", "layout");
  return {
    message: "Item created successfully",
  };
}

export async function updateItem(id: number, data: ItemValidator) {
  const isItemExist = await prisma.item.findUnique({
    where: {
      id: id,
    },
  });

  if (!isItemExist) {
    return {
      error: {
        key: "id",
        message: "Item not found",
      },
    };
  }
  await prisma.item.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      serialNumber: data.serialNumber,
      description: data.description,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Item updated successfully",
  };
}

export async function deleteItem(id: number) {
  const isItemExist = await prisma.item.findUnique({
    where: {
      id: id,
    },
  });

  if (!isItemExist) {
    return {
      error: {
        key: "id",
        message: "Item not found",
      },
    };
  }
  await prisma.item.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Item deleted successfully",
  };
}
