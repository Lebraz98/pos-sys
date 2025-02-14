import InvoiceTable from "@/components/table/invoice-table";
import { getCustomers } from "@/services/customer-service";
import React, { Suspense } from "react";

export default async function page() {
  const customers = await getCustomers();
  return (
    <Suspense>
      <InvoiceTable customers={customers as any} />
    </Suspense>
  );
}
