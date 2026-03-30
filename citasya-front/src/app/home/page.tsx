"use client";
import SidebarLayout from "@/components/layout/SidebarLayout";
import PageLayout from "@/components/layout/PageLayout";
import { ComponentHome } from "./component";

export default function HomePage() {
      // Mock fecha actual
      const today = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    

  return (
    <SidebarLayout>
      <PageLayout
        title="Buenos dias, Admin"
        subtitle={today}
        showCreateButton = {false}
      >
        <ComponentHome />
      </PageLayout>
    </SidebarLayout>
  );
}
