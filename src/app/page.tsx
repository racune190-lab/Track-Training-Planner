import PlannerLoader from "@/components/PlannerLoader";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Track Training Planner</h1>
        <p className="text-zinc-600">
          Add your classes, work shifts, and other commitments. Your 800m training will be planned
          around them.
        </p>
      </header>
      <PlannerLoader />
    </main>
  );
}
