"use server";

import prisma from "@/prisma/prisma";
import type SaleValidator from "@/validator/sale-validator";
import { revalidatePath } from "next/cache";

export async function getSales() {
  return prisma.sale.findMany({
    orderBy: {
      id: "desc",
    },
    include: {
      customer: true,
      saleItems: {
        include: {
          item: {
            include: {
              product: true,
            },
          },
        },
      },
      salePayments: true,
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
  const result = await prisma.sale.create({
    data: {
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      note: data.note,

      status: data.type === "cash" ? "CLOSE" : "open",
      type: data.type,
      saleItems: {
        createMany: {
          data: data.saleItems.map((res) => ({
            itemId: res.itemId,
            price: res.price,
            quantity: res.quantity,
            total: res.price * res.quantity,
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
  }

  revalidatePath("/dashboard", "layout");
  return {
    message: "Sale created successfully",
  };
}

// export async function updateSale(id: number, data: SaleValidator) {
//   const isSaleExist = await prisma.sale.findUnique({
//     where: {
//       id: id,
//     },
//   });

//   if (!isSaleExist) {
//     return {
//       error: {
//         key: "id",
//         message: "Sale not found",
//       },
//     };
//   }
//   await prisma.sale.update({
//     where: {
//       id: id,
//     },
//     data: {
//       name: data.name,
//       barcode: data.barcode,
//       description: data.description,
//     },
//   });

//   revalidatePath("/dashboard/sales");
//   return {
//     message: "Sale updated successfully",
//   };
// }

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
