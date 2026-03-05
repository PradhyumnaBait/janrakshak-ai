import { DeepfakeUploader } from "@/components/DeepfakeUploader";

export default function DeepfakePage() {
  return (
    <div className="space-y-8">
      <DeepfakeUploader mode="video" />
      <DeepfakeUploader mode="audio" />
    </div>
  );
}

