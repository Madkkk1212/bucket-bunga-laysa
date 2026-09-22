import GardenLoadingTransition from '../components/ui/GardenLoadingTransition';

export default function DesignerLoading() {
  return <GardenLoadingTransition standalone={true} autoNavigate={false} durationMs={1600} />;
}
