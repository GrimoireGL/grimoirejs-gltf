import GLTFAnimationSampler from "./GLTFAnimationSampler";
import GLTFAnimationChannel from "./GLTFAnimationChannel";
interface GLTFAnimation {
  channels: GLTFAnimationChannel[];
  samplers: {
    [samplerKey: string]: GLTFAnimationSampler;
  };
  parameters: {
    [paramKey: string]: string;
  };
}

export default GLTFAnimation;
