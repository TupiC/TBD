import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyMap from "../../components/ui/Map";
import { MytripTimeline } from "@/components/ui/MytripTimeline";
import { EXPS } from "@/dummy/dummy-data";
import { toMapPoints, toTimelineExps } from "@/lib/mapper";

const Page = (): React.JSX.Element => {

  const demoExps = toMapPoints(EXPS);
  const demoTimelineExps = toTimelineExps(EXPS);

  return (
    <main
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px 10px",
        backgroundColor: "#A52522",
      }}
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
          className="w-full flex gap-2 bg-gray-200 rounded-md "
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
          <MytripTimeline exps={demoTimelineExps} />
        </TabsContent>
        <TabsContent className="flex" value="map">
          <MyMap points={demoExps} zoom={13} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Page;