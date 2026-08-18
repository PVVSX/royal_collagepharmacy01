import { TeacherCourseRosterPage } from "@/roles/teacher/features/workspace/TeacherWorkspacePage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TeacherCourseRosterPage courseOfferingId={id} />; }
