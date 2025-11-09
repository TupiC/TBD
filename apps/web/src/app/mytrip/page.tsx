import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyMap, { MapPoint } from "../../components/ui/Map";
import { MytripTimeline, TimelineExp } from "@/components/ui/MytripTimeline";

const Page = (): React.JSX.Element => {
  const demoExps: MapPoint[] = EXPS.map((exp, index) => ({
    id: index,
    lat: exp.geo.lat,
    lng: exp.geo.lon,
    title: exp.name,
    thumbnailUrl: exp.hero_image,
    description: exp.summary,
    category: exp.category,
    url: exp.url,
  }));

  const demoTimelineExps: TimelineExp[] = demoExps.map((exp, index) => ({
    ...exp,
    id: exp.id ?? index,
    startDate: "2024-06-0" + (index + 1),
    endDate: "2024-06-0" + (index + 2),
  }));

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
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        Your Trip
      </h1>
      <Tabs defaultValue="timeline" className="w-[100%] flex-1 flex flex-col">
        <TabsList className="w-full flex gap-2 bg-gray-200 p-2 rounded-md">
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

const EXPS = [
  {
    key: "antheringer-au-az-281397",
    origin_url: "https://atc-anthering.sportunion.at/",
    category: "outdoor",
    url: "https://www.salzburg.info/de/reiseinfos/salzburg-a-z/antheringer-au_az_281397",
    source_url:
      "https://www.salzburg.info/de/reiseinfos/salzburg-a-z/antheringer-au_az_281397",
    source_list:
      "https://www.salzburg.info/de/salzburg/sport-freizeit/wandern#wanderwege",
    name: "Antheringer Au",
    summary:
      "Die Wanderung durch die Antheringer Au ist zu jeder Jahreszeit ein besonderes Naturerlebnis. In diesem naturbelassenem Schutzgebiet wartet eine sehenswerte Naturlandschaft und spannende Tierwelt auf die Kinder und Eltern: Biberteich, seltene Vogelarten wie Eisvogel oder Grauspecht, Reh- und Damwild und natürlich die hier beheimateten Wildschweine, die je nach Jahreszeit mit ihren Frischlingen durch die Au streifen. Am Ende des Weges erreicht man die mächtige Salzach, an deren Ufer man weiterwandern kann. ",
    hero_image:
      "https://www.salzburg.info/deskline/infrastruktur/objekte/antheringer-au_281397/image-thumb__667090__slider-main/Familienwanderung%20in%20der%20Au_281399.jpg",
    address: {
      street: "Freizeitpark 5",
      postal_code: "5102",
      locality: "Anthering",
      region: "AT",
      country: null,
    },
    geo: {
      lat: 47.875634867134,
      lon: 13.00077066499,
    },
    start_month: 1,
    end_month: 12,
    opening_hours: null,
    adults_only: false,
    free_access: false,
    images: [
      "https://www.salzburg.info/deskline/infrastruktur/objekte/antheringer-au_281397/image-thumb__667091__slider-main/Antheringer%20Au%20im%20Herbst%20_281400.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/antheringer-au_281397/image-thumb__667092__slider-main/Herbstlaub%20Familie%20Au%20Anthering_281401.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/antheringer-au_281397/image-thumb__667093__slider-main/Wildschweine%20Antheringer%20Au_281402.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/antheringer-au_281397/image-thumb__667094__slider-main/bl%C3%BChender%20B%C3%A4rlauch%20Antheringer%20Au_281403.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/antheringer-au_281397/image-thumb__667090__slider-main/Familienwanderung%20in%20der%20Au_281399.jpg",
    ],
    dogs_allowed: true,
    accessibility_state: "full",
  },
  {
    key: "auto-musik-museum-manro-classic-az-16179",
    origin_url: "https://www.manro-classic.at",
    category: "museum",
    url: "https://www.salzburg.info/de/reiseinfos/salzburg-a-z/auto-musik-museum-manro-classic_az_16179",
    source_url:
      "https://www.salzburg.info/de/reiseinfos/salzburg-a-z/auto-musik-museum-manro-classic_az_16179",
    source_list:
      "https://www.salzburg.info/de/sehenswertes/ausflugsziele/ausflugsziele-um-salzburg-uebersicht",
    name: 'Auto & Musik Museum "Manro-Classic"',
    summary:
      "Ein Paradies für Auto-Liebhaber\nHauptsächlich sind es italienische, englische, amerikanische und deutsche Fahrzeuge, die von jeher in geringer Stückzahl produziert wurden, die im Manro-Classic Auto &amp; Musik Museum ausgestellt sind. Alle Raritäten sind voll funktionsfähig und werden bei Ausfahrten und Oldtimerrallyes regelmäßig zur Schau gestellt. ",
    hero_image:
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666985__slider-main/Oldtimer-Ausstellung_16181.jpg",
    address: {
      street: "Gewerbepark Habach 1",
      postal_code: "5321",
      locality: "Koppl bei Salzburg",
      region: "AT",
      country: null,
    },
    geo: {
      lat: 47.8173354,
      lon: 13.1604817,
    },
    start_month: 1,
    end_month: 12,
    opening_hours: {
      mo: {
        from: 0,
        to: 0,
      },
      tu: {
        from: 0,
        to: 0,
      },
      we: {
        from: 0,
        to: 0,
      },
      th: {
        from: 1000,
        to: 1700,
      },
      fr: {
        from: 930,
        to: 1700,
      },
      sa: {
        from: 930,
        to: 1700,
      },
      su: {
        from: 930,
        to: 1700,
      },
    },
    adults_only: false,
    free_access: false,
    images: [
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666986__slider-main/B%C3%BChne%20bei%20Manro_16182.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666987__slider-main/Rennwagen_16183.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666988__slider-main/Oldtimer_16184.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666989__slider-main/Musikbox_16185.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666990__slider-main/Motorrad-Oldtimer_16186.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/manro---classic-auto-musik-museum_16179/image-thumb__666985__slider-main/Oldtimer-Ausstellung_16181.jpg",
    ],
    dogs_allowed: false,
    accessibility_state: "partly",
  },
  {
    key: "gollinger-wasserfall-az-1666569",
    origin_url: "https://golling.info/wasserfall",
    category: "outdoor",
    url: "https://www.salzburg.info/de/reiseinfos/salzburg-a-z/gollinger-wasserfall_az_1666569",
    source_url:
      "https://www.salzburg.info/de/reiseinfos/salzburg-a-z/gollinger-wasserfall_az_1666569",
    source_list:
      "https://www.salzburg.info/de/sehenswertes/ausflugsziele/ausflugsziele-um-salzburg-uebersicht",
    name: "Gollinger Wasserfall",
    summary:
      "Der Gollinger Wasserfall \nGolling liegt etwa 30 km südlich von Salzburg. Im Ortsteil Torren („torren“ romanisch: tosender Wildbach) stürzt der Wasserfall in zwei Fallstufen ganze 75 Höhenmeter in die Tiefe. Der Wanderweg dorthin führt beinahe vollständig durch den Wald und ist auch für Kinder gut geeignet. Nach etwa 40 Minuten kann man sogar den Ursprung des Wasserfalls sehen. ",
    hero_image:
      "https://www.salzburg.info/deskline/infrastruktur/objekte/gollinger-wasserfall_1666569/image-thumb__664783__slider-main/Gollinger%20Wasserfall_1666571.jpg",
    address: {
      street: "Gollinger Wasserfall",
      postal_code: "5440",
      locality: "Golling",
      region: "AT",
      country: null,
    },
    geo: {
      lat: 47.601478389071,
      lon: 13.137267986069,
    },
    start_month: 4,
    end_month: 11,
    opening_hours: {
      mo: {
        from: 900,
        to: 1800,
      },
      tu: {
        from: 900,
        to: 1800,
      },
      we: {
        from: 900,
        to: 1800,
      },
      th: {
        from: 900,
        to: 1800,
      },
      fr: {
        from: 900,
        to: 1800,
      },
      sa: {
        from: 900,
        to: 1800,
      },
      su: {
        from: 900,
        to: 1800,
      },
    },
    adults_only: false,
    free_access: false,
    images: [
      "https://www.salzburg.info/deskline/infrastruktur/objekte/gollinger-wasserfall_1666569/image-thumb__664784__slider-main/Bluntautal_1666572.jpg",
      "https://www.salzburg.info/deskline/infrastruktur/objekte/gollinger-wasserfall_1666569/image-thumb__664783__slider-main/Gollinger%20Wasserfall_1666571.jpg",
    ],
    dogs_allowed: true,
    accessibility_state: "none",
  },
];
