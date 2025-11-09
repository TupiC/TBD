// app/mytrip/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripTimeline } from "@/components/mytrip/trip-timeline";
import { EXPS } from "@/dummy/dummy-experiences";
import { toMapPoints } from "@/lib/mapper";
import { DEMO_VISITS } from "@/dummy/dummy-visits";
import Heading from "@/components/typography/heading";

// ⬇️ Import the map without SSR to avoid "window is not defined"
const MyMap = dynamic(() => import("../../components/ui/Map"), { ssr: false });

const Page = (): React.JSX.Element => {
  const [tab, setTab] = useState<"timeline" | "map">("timeline");
  const demoExps = toMapPoints(EXPS);

  return (
    <main className="min-h-screen flex flex-col p-4 bg-[#A52522]">
      <Heading>Your Trip</Heading>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "timeline" | "map")}
        className="w-full flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full flex gap-2 rounded-md mb-4">
          <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
          <TabsTrigger value="map" className="flex-1">Map</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="flex flex-1 min-h-0">
          <TripTimeline visits={DEMO_VISITS} />
        </TabsContent>

        <TabsContent value="map" className="flex flex-1 min-h-0">
          {/* Mount only when visible; give it height and rounded corners */}
          {tab === "map" && (
            <div className="flex-1 min-h-[320px]" style={{ borderRadius: 8, overflow: "hidden" }}>
              <MyMap points={demoExps} zoom={13} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Page;
