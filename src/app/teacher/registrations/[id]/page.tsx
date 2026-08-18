import TeacherWorkspacePage from "@/roles/teacher/features/workspace/TeacherWorkspacePage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeacherWorkspacePage section="registrations" resourceId={id} />; }
