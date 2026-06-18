import { NovoLugarPage } from "@/features/lugares/pages/NovoLugarPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <NovoLugarPage />
    </Suspense>
  );
}
