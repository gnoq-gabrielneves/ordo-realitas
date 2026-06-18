import { EditarSujeitoPage } from "@/features/sujeitos/pages/EditarSujeitoPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditarSujeitoPage id={id} />;
}
