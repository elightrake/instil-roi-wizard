
import ROICalculator from "@/components/ROICalculator";

const Index = () => {
  // Check if we're in an embedded context using URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedded = urlParams.get('embedded') === 'true';

  return (
    <div className={`min-h-screen bg-instil-dark ${isEmbedded ? 'bg-transparent p-0' : ''}`}>
      <ROICalculator />
    </div>
  );
};

export default Index;
