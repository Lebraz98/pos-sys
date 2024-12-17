import SalesTable from "@/components/table/sales-table";
import { getCustomers } from "@/services/customer-service";
import { getSales } from "@/services/sale-service";
import React, { Suspense } from "react";

export default async function page() {
  const sales = await getSales();
  const customers = await getCustomers();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalesTable data={sales} customers={customers as any} />
    </Suspense>
  );
}
