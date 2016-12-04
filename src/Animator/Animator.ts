import ConstantConverter from "../Parser/ConstantConverter";
import Accessor from "../Accessor/Accessor";
import GLTF from "../Parser/Schema/GLTF";
export default class Animator {

  private _inputFrames: number[];

  private _transformFrames: { [paramName: string]: number[] }[];

  constructor(public tf: GLTF, public animationKey: string, private _buffers: { [bufferName: string]: ArrayBufferView }) {
    const animation = tf.animations[animationKey];
    const accessors = {} as { [key: string]: Accessor };
    for (let key in animation.parameters) {
      const ac = tf.accessors[animation.parameters[key]];
      accessors[key] = new Accessor(_buffers[ac.bufferView], ac.count, ac.componentType, ConstantConverter.asVectorSize(ac.type), ac.byteOffset || 0, ac.byteStride || 0);
    }
  }

  public getFrame(t: number): void {

  }
}
