"use server";

import prisma from "@/prisma/prisma";
import type SaleValidator from "@/validator/sale-validator";
import { revalidatePath } from "next/cache";
import { getLastRate } from "./rate-service";

export async function getSales(props?: {
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
}) {
  return prisma.sale.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      customer: true,
      saleItems: {
        include: {
          rate: true,
          item: {
            include: {
              product: true,
            },
          },
        },
      },
      salePayments: true,
    },
    where: {
      createdAt: {
        gte: props?.fromDate,
        lte: props?.toDate,
      },
      customerId: props?.customerId,
    },
  });
}
export async function getSale(id: number) {
  return prisma.sale.findUnique({
    where: {
      id: id,
    },
  });
}

export async function createSale(data: SaleValidator) {
  const rate = getLastRate();
  const total =
    data.total ??
    data.saleItems.reduce((prev, cur) => cur.price * cur.quantity + prev, 0);
  const result = await prisma.sale.create({
    data: {
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      note: data.note,
      total: total,

      status: data.type === "cash" ? "close" : "open",
      type: data.type,
      saleItems: {
        createMany: {
          data: data.saleItems.map((res) => ({
            itemId: res.itemId,
            price: res.price,
            quantity: res.quantity,
            total: res.price * res.quantity,
            rateId: rate[0]?.value,
            note: res.note,
          })),
        },
      },
    },
  });

  if (result.type === "cash") {
    await prisma.salePayment.create({
      data: {
        amount: data.saleItems.reduce(
          (prev, cur) => cur.price * cur.quantity + prev,
          0
        ),
        type: "cash",
        saleId: result.id,
      },
    });
  } else if (data.paid) {
    const m = await prisma.salePayment.create({
      data: {
        amount: data.paid,
        type: "cash",
        saleId: result.id,
      },
    });
    if (
      m.amount ===
      data.saleItems.reduce((prev, cur) => cur.price * cur.quantity + prev, 0)
    ) {
      await prisma.sale.update({
        where: {
          id: result.id,
        },
        data: {
          status: "close",
        },
      });
    }
  }

  revalidatePath("/dashboard", "layout");
  return {
    message: "Sale created successfully",
  };
}
export async function closeSale(id: number) {
  await prisma.sale.update({
    where: {
      id: id,
    },
    data: {
      status: "close",
    },
  });
  return {
    message: "Sale closed successfully",
  };
}

export async function updateSalePayments(id: number, paid: number) {
  const isSaleExist = await prisma.sale.findUnique({
    where: {
      id: id,
    },
    include: {
      saleItems: true,
      salePayments: true,
    },
  });

  if (!isSaleExist) {
    return {
      error: {
        key: "id",
        message: "Sale not found",
      },
    };
  }
  await prisma.salePayment.create({
    data: {
      amount: paid,
      type: "cash",
      saleId: id,
    },
  });
  if (
    isSaleExist.salePayments.reduce((a, b) => b.amount + a, 0) + paid ===
    isSaleExist.saleItems.reduce(
      (prev, cur) => cur.price * cur.quantity + prev,
      0
    )
  ) {
    await prisma.sale.update({
      where: {
        id: id,
      },
      data: {
        status: "close",
      },
    });
  }

  revalidatePath("/dashboard");
  return {
    message: "Sale updated successfully",
  };
}

export async function deleteSale(id: number) {
  const isSaleExist = await prisma.sale.findUnique({
    where: {
      id: id,
    },
  });

  if (!isSaleExist) {
    return {
      error: {
        key: "id",
        message: "Sale not found",
      },
    };
  }
  await prisma.saleItem.deleteMany({
    where: {
      saleId: id,
    },
  });
  await prisma.salePayment.deleteMany({
    where: {
      saleId: id,
    },
  });
  await prisma.sale.delete({
    where: {
      id: id,
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    message: "Sale deleted successfully",
  };
}
