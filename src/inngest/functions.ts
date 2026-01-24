import JSONL from 'jsonl-parse-stringify';
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from '@/modules/meetings/types';
import { createAgent, openai, TextMessage } from '@inngest/agent-kit';

import { db } from '@/db';
import { agents, meetings, user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

const summarizer = createAgent({
  name: "summarizer",
  system: `
    You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

    Use the following markdown structure for every output:

    ### Overview
    Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

    ### Notes
    Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

    Example:
    #### Section Name
    - Main point or demo shown here
    - Another key insight or interaction
    - Follow-up tool or explanation provided

    #### Next Section
    - Feature X automatically does Y
    - Mention of integration with Z
  `.trim(),
  model: openai({ model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY }),
});

export const meetingProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {

    // for production
    const response = await step.run('fetch-transript', async () => {
      return fetch(event.data.transriptUrl).then((res) => res.text());
    });

    const transcript = await step.run('parse-transcript', async () => {
      return JSONL.parse<StreamTranscriptItem>(response);
    });
    
    // For development
    // const response = await step.fetch(event.data.transcriptUrl);

    // const transcript = await step.run('parse-transcript', async () => {
    //   const text = await response.text();
    //   return JSONL.parse<StreamTranscriptItem>(text);
    // })

    const transcriptWithSpeaker = await step.run('add-speakers', async () => {
      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];

      const userTranscript = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
          }))
        );

      const agentTranscript = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
          })));

      const speakers = [...userTranscript, ...agentTranscript];

      return transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id,
        );

        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown"
            }
          }
        };

        return {
          ...item,
          user: {
            name: speaker.name,
          }
        }
      })
    });

    const { output } = await summarizer.run(
      "Summarize the following transcript: " +
      JSON.stringify(transcriptWithSpeaker),
    );

    await step.run('save-summary', async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: 'completed',
        })
        .where(eq(meetings.id, event.data.meetingId))
    });
  }
);