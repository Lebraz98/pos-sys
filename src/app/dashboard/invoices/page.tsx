import InvoiceTable from "@/components/table/invoice-table";
import { getCustomers } from "@/services/customer-service";
import React from "react";

export default async function page() {
  const customers = await getCustomers();
  return (
    <div>
      <InvoiceTable customers={customers as any} />
    </div>
  );
}
