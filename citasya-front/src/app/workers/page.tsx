"use client";
import * as React from "react";
import { SpecialistList } from "../../components/worker/WorkerList";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

function Workers() {
  useAuthRedirect();
  return (
    <div
      className="relative z-0 flex flex-col items-center min-h-screen w-full bg-[#F9FAFB] pb-20 px-4 sm:px-6 lg:px-10"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <main className="flex flex-col items-center w-full max-w-[1273px] mt-8 sm:mt-10 flex-grow">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#447F98] text-center mb-8"
          style={{ fontFamily: "Roboto Condensed, sans-serif" }}
        >
          Directorio de Especialistas
        </h1>

        <section className="w-full flex-grow h-full">
          <SpecialistList />
        </section>
      </main>
    </div>
  );
}

export default Workers;
