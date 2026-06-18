import { SujeitoDetailPage } from "@/features/sujeitos/pages/SujeitoDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <SujeitoDetailPage id={id} />;
}
