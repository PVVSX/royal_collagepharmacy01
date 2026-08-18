"use client";

import { WorkspaceRouteError } from "@/roles/shared/components/workspace/WorkspaceRouteStates";

export default function ErrorBoundary(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <WorkspaceRouteError {...props} />;
}
