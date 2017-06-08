import GLTFAnimationSampler from "./GLTFAnimationSampler";
import GLTFAnimationChannel from "./GLTFAnimationChannel";
interface GLTFAnimation {
  channels: GLTFAnimationChannel[];
  samplers: {
    [samplerKey: string]: GLTFAnimationSampler;
  };
}

export default GLTFAnimation;
