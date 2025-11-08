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
      <h1>Map Demo</h1>
      <MyMap points={demoPoints} zoom={13} />
    </main>
  )
}

export default Page
