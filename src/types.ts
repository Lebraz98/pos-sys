import { Prisma } from "@prisma/client";
type Product = Prisma.ProductGetPayload<{
  include: {
    items: true;
  };
}>;

type Item = Prisma.ItemGetPayload<{
  include: {
    product: true;
  };
}>;
type Customer = Prisma.CustomerGetPayload<{
  include: {
    sales: {
      include: {
        saleItems: {
          include: {
            item: {
              include: {
                product: true;
              };
            };
          };
        };
        salePayments: true;
      };
    };
  };
}>;

type Sale = Prisma.SaleGetPayload<{
  include: {
    customer: true;
    salePayments: true;
    saleItems: {
      include: {
        rate: true;
        item: {
          include: {
            product: true;
          };
        };
      };
    };
  };
}>;

type SalePayment = Prisma.SalePaymentGetPayload<{
  include: {
    sale: true;
  };
}>;
type ItemNeeded = Prisma.ItemNeededGetPayload<{
  include: {
    item: {
      include: {
        product: true;
      };
    };
  };
}>;
type Rate = Prisma.RateGetPayload<undefined>;
type Invoice = Prisma.InvoiceGetPayload<{
  include: {
    customer: true;
    payments: true;
    rate: true;
  };
}> & {
  JsonData?: {
    title: string;
    price: number;
    quantity: number;
  }[];
};

type Payment = Prisma.PaymentGetPayload<{
  include: {
    invoice: true;
    rate: true;
  };
}>;

export function getInvoiceWithJsonData(data?: Invoice): Invoice | undefined {
  return data
    ? {
        ...data,
        JsonData: data.data
          ? JSON.parse(data.data).map((item) => ({
              title: item.product.name,
              price: item.price,
              quantity: item.quantity,
            }))
          : [],
      }
    : data;
}
export function serlizeInvoiceData(data?: string | null): Invoice["JsonData"] {
  return data
    ? JSON.parse(data ?? "[]").map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }))
    : [];
}
export type {
  Item,
  Product,
  Customer,
  Sale,
  SalePayment,
  ItemNeeded,
  Rate,
  Invoice,
};
