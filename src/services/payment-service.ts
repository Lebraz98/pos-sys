"use server";

import prisma from "@/prisma/prisma";
import type PaymentValidator from "@/validator/payment-validator";
import { revalidatePath } from "next/cache";
import { getLastRate } from "./rate-service";

export async function getPayments(props?: {
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
}) {
  return prisma.payment.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      invoice: {
        include: {
          customer: true,
          rate: true,
        },
      },
    },
    where: {
      createdAt: {
        gte: props?.fromDate,
        lte: props?.toDate,
      },
      invoice: {
        customerId: props?.customerId,
      },
    },
  });
}
export async function getPayment(id: number) {
  return prisma.payment.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createPayment(data: PaymentValidator) {
  const rate = await getLastRate();

  const result = await prisma.payment.create({
    data: {
      invoiceId: data.invoiceId,
      note: data.note,
      amount: data.amount,
      date: data.date,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Payment created successfully",
  };
}

export async function updatePayment(id: number, paid: number) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: id,
    },
  });

  if (!payment) {
    return {
      error: {
        key: "id",
        message: "Payment not found",
      },
    };
  }

  if (payment.amount < paid) {
    return {
      error: {
        key: "paid",
        message: "Paid amount is greater than payment amount",
      },
    };
  }

  revalidatePath("/dashboard", "layout");
  return {
    message: "Payment added successfully",
  };
}

export async function deletePayment(id: number) {
  const isPaymentExist = await prisma.payment.findUnique({
    where: {
      id: id,
    },
  });

  if (!isPaymentExist) {
    return {
      error: {
        key: "id",
        message: "Payment not found",
      },
    };
  }

  await prisma.payment.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Payment deleted successfully",
  };
}
