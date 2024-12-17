import ItemsNeededTable from "@/components/table/items-needed-table";
import ItemTable from "@/components/table/items-table";
import { getItems } from "@/services/item-service";
import { getItemNeededs } from "@/services/items-needed-service";
import { getProducts } from "@/services/product-service";
import { LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";

export default async function page() {
  const itemsNeeded = await getItemNeededs();
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <ItemsNeededTable data={itemsNeeded} items={await getItems()} />
    </Suspense>
  );
}
