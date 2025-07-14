"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeView() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Loader color='#9ca3af' className="animate-spin transition duration-900 w-20 h-20" />
      </div>
    );
  }
  return (
    <div>
      <div className="p-4 flex flex-col gap-y-4">
        <p>Logged in as {session.user.name}</p>
        <Button
          onClick={() =>
            authClient.signOut({
              fetchOptions: { onSuccess: () => router.push("/sign-in") },
            })
          }
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
