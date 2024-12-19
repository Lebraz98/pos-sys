import CustomerTable from "@/components/table/customer-table";
import { getCustomers } from "@/services/customer-service";
import { LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";

export default async function page() {
  const customers = await getCustomers();
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <CustomerTable data={customers as any} />
    </Suspense>
  );
}
