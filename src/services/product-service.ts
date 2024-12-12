"use server";

import prisma from "@/prisma/prisma";
import type ProductValidator from "@/validator/product-validator";
import type { Product } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
  });
}
export async function getProduct(id: number) {
  return prisma.product.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createProduct(data: ProductValidator) {
  const isProductExist = await prisma.product.findFirst({
    where: {
      OR: [
        {
          name: data.name,
        },
        {
          barcode: data.barcode,
        },
      ],
    },
  });

  if (isProductExist) {
    if (isProductExist?.name == data.name) {
      return {
        error: {
          key: "name",
          message: "Product name already exist",
        },
      };
    } else if (isProductExist?.barcode == data.barcode) {
      return {
        error: {
          key: "barcode",
          message: "Product barcode already exist",
        },
      };
    }
  } else {
    await prisma.product.create({
      data: {
        name: data.name,
        barcode: data.barcode,
        description: data.description,
      },
    });
  }
  revalidatePath("/dashboard/products");
  return {
    message: "Product created successfully",
  };
}

export async function updateProduct(id: number, data: ProductValidator) {
  const isProductExist = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!isProductExist) {
    return {
      error: {
        key: "id",
        message: "Product not found",
      },
    };
  }
  await prisma.product.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      barcode: data.barcode,
      description: data.description,
    },
  });

  revalidatePath("/dashboard/products");
  return {
    message: "Product updated successfully",
  };
}

export async function deleteProduct(id: number) {
  const isProductExist = await prisma.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!isProductExist) {
    return {
      error: {
        key: "id",
        message: "Product not found",
      },
    };
  }
  await prisma.product.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard/products");
  return {
    message: "Product deleted successfully",
  };
}
