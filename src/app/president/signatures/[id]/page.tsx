import PresidentSignatureDetailPage from "@/roles/president/features/signatures/PresidentSignatureDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PresidentSignatureDetailPage requestId={decodeURIComponent(id)} />;
}
