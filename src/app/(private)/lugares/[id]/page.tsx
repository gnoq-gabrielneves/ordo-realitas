import { LugarDetailPage } from "@/features/lugares/pages/LugarDetailPage";

interface Props { params: Promise<{ id: string }> }

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <LugarDetailPage id={id} />;
}
