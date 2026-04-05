"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-end px-6">
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Uitloggen
      </Button>
    </header>
  );
}
