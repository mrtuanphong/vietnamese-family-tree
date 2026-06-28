"use client";

import { use } from "react";
import ListPageContent from "@/components/list/ListPageContent";

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ListPageContent activeTab="people" initialPersonId={id} />;
}
