import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/** Legacy PDF iframe preview — redirect to text reading view. */
export default async function MaterialPreviewRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/studenti/materialy/${id}/cist`);
}
