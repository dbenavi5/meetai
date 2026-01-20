import { auth } from "@/lib/auth";
import { CallView } from "@/modules/call/ui/views/call-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
// import { Suspense } from "react";
// import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{
    meetingId: string;
  }>;
}

const CallMeetingIdPage = async ({ params }: Props) => {
  const { meetingId } = await params;

  // This assures only authenticated users can visit this page
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <Suspense fallback={<p>Loading</p>}>
        <ErrorBoundary fallback={<p>error</p>}> */}
          <CallView meetingId={meetingId} />
        {/* </ErrorBoundary>
      </Suspense> */}
    </HydrationBoundary>
  );
};

export default CallMeetingIdPage;