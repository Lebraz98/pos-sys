import ProductTable from "@/components/table/product-table";
import { getProducts } from "@/services/product-service";
import { LoadingOverlay } from "@mantine/core";
import React, { Suspense } from "react";

export default async function page() {
  const products = await getProducts();
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <ProductTable data={products} />
    </Suspense>
  );
}
