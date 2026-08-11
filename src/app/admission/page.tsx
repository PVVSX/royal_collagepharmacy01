import { redirect } from "next/navigation";

export default function AdmissionEntryPage() {
  redirect("/?next=/member/admission");
}
