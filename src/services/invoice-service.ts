"use server";

import prisma from "@/prisma/prisma";
import type InvoiceValidator from "@/validator/invoice-validator";
import { revalidatePath } from "next/cache";
import { getLastRate } from "./rate-service";

export async function getInvoices(props?: {
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
  type?: string;
}) {
  return prisma.invoice.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      customer: true,
      rate: true,
      payments: true,
    },
    where: {
      createdAt: {
        gte: props?.fromDate,
        lte: props?.toDate,
      },
      type: props?.type,
      customerId: props?.customerId,
    },
  });
}
export async function getInvoice(id: number) {
  return prisma.invoice.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createInvoice(data: InvoiceValidator) {
  const rate = await getLastRate();

  const result = await prisma.invoice.create({
    data: {
      customerId: data.customerId,
      note: data.note,
      title: data.title,
      description: data.description,
      amount: data.amount,
      rateId: rate?.[0]?.id,
      date: data.date,
      type: data.type,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Invoice created successfully",
  };
}

export async function updateInvoicePayments(id: number, paid: number) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: id,
    },
  });

  if (!invoice) {
    return {
      error: {
        key: "id",
        message: "Invoice not found",
      },
    };
  }

  if (invoice.amount < paid) {
    return {
      error: {
        key: "paid",
        message: "Paid amount is greater than invoice amount",
      },
    };
  }

  await prisma.payment.create({
    data: {
      invoiceId: id,
      amount: paid,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Payment added successfully",
  };
}

export async function deleteInvoice(id: number) {
  const isInvoiceExist = await prisma.invoice.findUnique({
    where: {
      id: id,
    },
  });

  if (!isInvoiceExist) {
    return {
      error: {
        key: "id",
        message: "Invoice not found",
      },
    };
  }
  await prisma.payment.deleteMany({
    where: {
      invoiceId: id,
    },
  });

  await prisma.invoice.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Invoice deleted successfully",
  };
}
