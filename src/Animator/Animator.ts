import ConstantConverter from "../Parser/ConstantConverter";
import Accessor from "../Accessor/Accessor";
import GLTF from "../Parser/Schema/GLTF";
export default class Animator {

  private _accessors: { [accessorId: string]: Accessor } = {};

  constructor(public tf: GLTF, public animationKey: string, private _buffers: { [bufferName: string]: ArrayBuffer }) {
    const animation = tf.animations[animationKey];
    for (let key in animation.parameters) {
      const ac = tf.accessors[animation.parameters[key]];
      this._accessors[key] = new Accessor(new DataView(_buffers[ac.bufferView]), ac.count, ac.componentType, ConstantConverter.asVectorSize(ac.type), ac.byteOffset, ac.byteStride);
    }
  }

  public getFrame(t: number): void {

  }
}
