import SalesTable from "@/components/table/sales-table";
import { getSales } from "@/services/sale-service";
import React, { Suspense } from "react";

export default async function page() {
  const sales = await getSales();
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalesTable data={sales} />
    </Suspense>
  );
}
