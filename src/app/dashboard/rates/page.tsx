import RateTable from "@/components/table/rate-table";
import { getRates } from "@/services/rate-service";
import React from "react";

export default async function page() {
  const rates = await getRates();
  return (
    <div>
      <RateTable data={rates} />
    </div>
  );
}
