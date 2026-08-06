import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Willkommen bei Elephant Bookings</h1>
      <p className="text-muted-foreground">
        Verwalten Sie Ihre Buchungen und Kunden einfach und effizient.
      </p>
      <div className="flex flex-col gap-2">
        <Link href="/superadmin/workspaces" className="w-fit">
          <Button className="relative animate-bounce px-4">Workspaces</Button>
        </Link>

        <Link href="/superadmin/users" className="w-fit">
          <Button className="animate-pulse px-4">Users</Button>
        </Link>
      </div>
    </div>
  );
}
