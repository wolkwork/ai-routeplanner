"use client";

import { Message, useChat } from "ai/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { MapRef, Marker, Map } from "react-map-gl";
import Pin from "./components/Pin";

import "mapbox-gl/dist/mapbox-gl.css";
import { Waypoint } from "./utils/types";

const initialViewState = {
  longitude: 5.249209225090425,
  latitude: 49.4617243375219,
  zoom: 3.8907766170599363,
};

export default function Chat() {
  let ref = React.useRef<MapRef>(null);

  const [waypoints, setWaypoints] = React.useState<Waypoint[]>([]);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxToolRoundtrips: 5,

    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "showRoute") {
        let waypoints = (toolCall.args as { waypoints: Waypoint[] }).waypoints;
        setWaypoints(waypoints);

        let minLat = Math.min(...waypoints.map((w) => w.latitude));
        let maxLat = Math.max(...waypoints.map((w) => w.latitude));
        let minLon = Math.min(...waypoints.map((w) => w.longitude));
        let maxLon = Math.max(...waypoints.map((w) => w.longitude));

        ref?.current?.fitBounds(
          [
            [minLon, minLat],
            [maxLon, maxLat],
          ],
          {
            padding: 80,
          }
        );

        return JSON.stringify(waypoints);
      }

      return;
    },
  });

  return (
    <div>
      <div className="grid grid-cols-2 h-screen overflow-hidden">
        <div className="flex flex-col h-screen p-6">
          <div className="overflow-auto flex-1 flex flex-col gap-3 prose prose-p:first-of-type:mt-0">
            {messages
              ?.filter((m) => Boolean(m.content))
              .map((m: Message) => (
                <div key={m.id} className="flex flex-col gap-1">
                  <strong className="capitalize">{`${m.role}: `}</strong>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ))}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
              className="border border-border rounded px-4 py-3 w-full"
            />
          </form>
        </div>

        <div>
          <Map
            ref={ref}
            initialViewState={initialViewState}
            style={{ width: 600, height: "100vh" }}
            attributionControl={false}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          >
            {waypoints.map((place, index) => (
              <Marker
                key={`marker-${index}`}
                longitude={place.longitude}
                latitude={place.latitude}
                anchor="bottom"
              >
                <Pin />
              </Marker>
            ))}
          </Map>
        </div>
      </div>
    </div>
  );
}
