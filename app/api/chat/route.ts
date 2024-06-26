import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";
import { waypointSchema } from "@/app/utils/types";

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
