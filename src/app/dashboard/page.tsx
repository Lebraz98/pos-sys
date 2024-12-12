import SaleItemsTable from "@/components/table/sales-item-table";
import { getCustomers } from "@/services/customer-service";
import { getItems } from "@/services/item-service";

export default async function page() {
  const items = await getItems();
  const customers = await getCustomers();
  return (
    <div style={{ height: "100%" }}>
      <SaleItemsTable items={items} customers={customers} />
    </div>
  );
}
