import ItemTable from "@/components/table/items-table";
import { getItems } from "@/services/item-service";
import { getProducts } from "@/services/product-service";
import { LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";

export default async function page() {
  const items = await getItems();
  const products = await getProducts();
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <ItemTable data={items} products={products} />
    </Suspense>
  );
}
