"use server";

import prisma from "@/prisma/prisma";
import type CustomerValidator from "@/validator/customer-validator";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      sales: true,
    },
  });
}
export async function getCustomer(id: number) {
  return prisma.customer.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createCustomer(data: CustomerValidator) {
  const isCustomerExist = await prisma.customer.findFirst({
    where: {
      OR: [
        {
          name: data.name,
        },
        {
          phone: data.phone,
        },
      ],
    },
  });

  if (isCustomerExist) {
    if (isCustomerExist?.name == data.name) {
      return {
        error: {
          key: "name",
          message: "Customer name already exist",
        },
      };
    } else if (isCustomerExist?.phone == data.phone) {
      return {
        error: {
          key: "phone",
          message: "Customer phone already exist",
        },
      };
    }
  } else {
    await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      },
    });
  }
  revalidatePath("/dashboard", "layout");
  return {
    message: "Customer created successfully",
  };
}

export async function updateCustomer(id: number, data: CustomerValidator) {
  const isCustomerExist = await prisma.customer.findUnique({
    where: {
      id: id,
    },
  });

  if (!isCustomerExist) {
    return {
      error: {
        key: "id",
        message: "Customer not found",
      },
    };
  }
  await prisma.customer.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Customer updated successfully",
  };
}

export async function deleteCustomer(id: number) {
  const isCustomerExist = await prisma.customer.findUnique({
    where: {
      id: id,
    },
  });

  if (!isCustomerExist) {
    return {
      error: {
        key: "id",
        message: "Customer not found",
      },
    };
  }
  await prisma.customer.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Customer deleted successfully",
  };
}
