import Interpolators from "./Interpolators";
import GLTFAnimation from "../Parser/Schema/GLTFAnimation";
import ConstantConverter from "../Parser/ConstantConverter";
import Accessor from "../Accessor/Accessor";
import GLTF from "../Parser/Schema/GLTF";
export default class Animator {

  public accessors: { [key: string]: Accessor } = {};

  private _animationData: GLTFAnimation;

  public timeLength: number = 0;

  public targetNodes: string[] = [];

  constructor(public tf: GLTF, public animationKey: string, private _buffers: { [bufferName: string]: ArrayBufferView }) {
    this._animationData = tf.animations[animationKey];
    const accessors = {} as { [key: string]: Accessor };
    for (let key in this._animationData.parameters) {
      const ac = tf.accessors[this._animationData.parameters[key]];
      this.accessors[key] = new Accessor(_buffers[ac.bufferView], ac.count, ac.componentType, ConstantConverter.asVectorSize(ac.type), ac.byteOffset || 0, ac.byteStride || 0);
    }
    for (let channel of this._animationData.channels) {
      const sampler = this._animationData.samplers[channel.sampler];
      const input = this.accessors[sampler.input];
      this.timeLength = Math.max(this.timeLength, input.getByIndex(input.count - 1)[0]);
      this.targetNodes.push(channel.target.id);
      if (channel.target.path === "rotation" && this._animationData.samplers[channel.sampler].interpolation === "LINEAR") {
        this._animationData.samplers[channel.sampler].interpolation = "SPHERICAL";
      }
    }
  }

  public processCurrentFrame(time: number, processor: (id: string, target: string, v: number[]) => void): void {
    for (let i = 0; i < this._animationData.channels.length; i++) {
      const channel = this._animationData.channels[i];
      const v = this._getBySampler(channel.sampler, time);
      processor(channel.target.id, channel.target.path, v);
    }
  }

  private _getBySampler(samplerName: string, t: number): number[] { // TODO binary search
    const sampler = this._animationData.samplers[samplerName];
    const inputAccessor = this.accessors[sampler.input];
    const outputAccessor = this.accessors[sampler.output];
    let i = 0;
    for (i = 0; i < inputAccessor.count; i++) {
      const nt = inputAccessor.getByIndex(i)[0];
      if (nt > t) {
        return this._complementFrame(t, inputAccessor.getByIndex(i - 1), inputAccessor.getByIndex(i), outputAccessor.getByIndex(i - 1), outputAccessor.getByIndex(i), sampler.interpolation);
      }
    }
    return this._complementFrame(t, inputAccessor.getByIndex(i - 1), null, outputAccessor.getByIndex(i - 1), null, sampler.interpolation);
  }

  private _complementFrame(t: number, t1: number[], t2: number[], v1: number[], v2: number[], interpolation: string): number[] {
    if (!v1) {
      return v2;
    }
    if (!v2) {
      return v1;
    }
    const delta = ((t2[0] - t) / (t2[0] - t1[0])); // TODO interpolator?
    return Interpolators[interpolation](delta, v1, v2)
  }
}
