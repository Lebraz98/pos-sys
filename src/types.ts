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

export type { Item, Product, Customer, Sale, SalePayment, ItemNeeded, Rate };
