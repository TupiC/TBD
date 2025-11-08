import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MyMap, { MapPoint } from '../../components/ui/Map'
const demoPoints: MapPoint[] = [
  {
    id: 1,
    // If your data is x/y, map it as: lat = y, lng = x
    lat: 47.7950851,
    lng: 13.0476631,
    title: 'Fortress Hohensalzburg',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1761839258657-457dda39b5cc?&auto=format&fit=crop&q=80&w=500',
    description: 'Heart of Vienna—great starting point for a city walk.',
  },
  {
    id: 2,
    lat: 47.7985537,
    lng: 13.040974,
    title: 'Great Festival House',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1761839258657-457dda39b5cc?&auto=format&fit=crop&q=80&w=500',
    description: 'Market stalls, snacks, and weekend vibes.',
  },
]

const Page = (): React.JSX.Element => {
  return (
    <main style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs defaultValue='timeline' className='w-[100%]'>
        <TabsList className='w-full flex gap-2 bg-gray-200 p-2 rounded-md'>
          <TabsTrigger value='timeline' className='flex-1'>
            Timeline
          </TabsTrigger>
          <TabsTrigger value='map' className='flex-1'>
            Map
          </TabsTrigger>
        </TabsList>
        <TabsContent value='timeline'>1</TabsContent>
        <TabsContent className="flex" value='map'>
          <MyMap points={demoPoints} zoom={13} />
        </TabsContent>
      </Tabs>
    </main>
  )
}

export default Page
