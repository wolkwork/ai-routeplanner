import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const waypointSchema = z.object({
  name: z.string().describe("Name of the location"),
  longitude: z.number().describe("Longitude of the location"),
  latitude: z.number().describe("Latitude of the location"),
});

export type Waypoint = z.infer<typeof waypointSchema>;
