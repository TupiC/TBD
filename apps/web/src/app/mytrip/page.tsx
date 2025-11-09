import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyMap from "../../components/ui/Map";
import { TripTimeline } from "@/components/mytrip/trip-timeline";
import { EXPS } from "@/dummy/dummy-experiences";
import { toMapPoints, toTimelineExps } from "@/lib/mapper";
import { DEMO_VISITS } from "@/dummy/dummy-visits";

const Page = (): React.JSX.Element => {

  const demoExps = toMapPoints(EXPS);
  const demoTimelineExps = toTimelineExps(EXPS);

  return (
    <main
      className="min-h-screen flex flex-col p-4 bg-[#A52522]"
    >
      <h1
        className="text-white"
        style={{
          fontSize: "32px",
          marginBottom: "16px",
        }}
      >
        Your Trip
      </h1>
      <Tabs defaultValue="timeline" className="w-[100%] flex-1 flex flex-col">
        <TabsList
          className="w-full flex gap-2 rounded-md "
          style={{ marginBottom: "16px" }}
        >
          <TabsTrigger value="timeline" className="flex-1">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="map" className="flex-1">
            Map
          </TabsTrigger>
        </TabsList>
        <TabsContent className="flex" value="timeline">
          <TripTimeline visits={DEMO_VISITS} />
        </TabsContent>
        <TabsContent className="flex" value="map">
          <MyMap points={demoExps} zoom={13} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Page;