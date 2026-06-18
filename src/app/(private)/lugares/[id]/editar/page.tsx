import { EditarLugarPage } from "@/features/lugares/pages/EditarLugarPage";

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditarLugarPage id={id} />;
}
