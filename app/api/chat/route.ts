import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const waypointSchema = z.object({
  name: z.string().describe("Name of the location"),
  longitude: z.number().describe("Longitude of the location"),
  latitude: z.number().describe("Latitude of the location"),
});

export type Waypoint = z.infer<typeof waypointSchema>;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages: convertToCoreMessages(messages),
    tools: {
      showRoute: {
        description:
          "Show a route to a user. Describe the route and how you created it afterwards.",
        parameters: z.object({
          waypoints: z
            .array(waypointSchema)
            .describe("List of waypoints in the route"),
        }),
      },
    },
  });

  return result.toAIStreamResponse();
}
