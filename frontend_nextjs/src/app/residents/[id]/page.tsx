import React from "react";
import ResidentProfileClient from "./ResidentProfileClient";

/**
 * Next.js static export requires dynamic routes to provide generateStaticParams.
 * We intentionally return an empty list because resident IDs are not known at build time.
 * (Later, backend can provide IDs at build-time if true static export is desired.)
 */
// PUBLIC_INTERFACE
export function generateStaticParams(): { id: string }[] {
  return [];
}

export default function ResidentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  return <ResidentProfileClient residentId={resolvedParams.id} />;
}
