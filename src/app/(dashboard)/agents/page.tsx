import { Suspense } from "react";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { auth } from "@/lib/auth";
import { getQueryClient, trpc } from "@/trpc/server";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ListHeader } from "@/modules/agents/ui/components/list-header";
import { AgentsView } from "@/modules/agents/ui/views/agents-view";

const AgentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

  return (
    <>
      <ListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <LoadingState
              title="Loading Agents"
              description="This may take a few seconds..."
            />
          }
        >
          <ErrorBoundary
            fallback={
              <ErrorState
                title="Failed to load agents"
                description="There was an error loading the agents. Please try again later."
              />
            }
          >
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default AgentsPage;
