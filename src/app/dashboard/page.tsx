import SaleItemsTable from "@/components/table/sales-out";
import { getCustomers } from "@/services/customer-service";
import { getItems } from "@/services/item-service";
import { Suspense } from "react";

export default async function page() {
  const items = await getItems();
  const customers = await getCustomers();
  return (
    <div style={{ height: "100%" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <SaleItemsTable items={items} customers={customers as any} />
      </Suspense>
    </div>
  );
}
