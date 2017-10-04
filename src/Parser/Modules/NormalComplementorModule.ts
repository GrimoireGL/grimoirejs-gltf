import ParserModule from "../ParserModule";
import { AddVertexAttributesArgument } from "../Arguments";
import Vector3 from "grimoirejs-math/ref/Vector3";
export default class NormalComplementorModule extends ParserModule {
  public complementVertexAttributes(args: AddVertexAttributesArgument): boolean {
    if (args.primitive.attributes["NORMAL"] === void 0 && args.primitive.attributes["POSITION"] !== void 0) {
      const accessor = args.tf.accessors[args.primitive.attributes["POSITION"]];
      const baseBufferView = args.bufferViews[accessor.bufferView];
      const positions = new Float32Array(baseBufferView.buffer, baseBufferView.byteOffset + accessor.byteOffset);
      // if (accessor.byteStride !== void 0 && accessor.byteStride !== 0) {
      //   throw new Error("Complementing normal with a position buffer which buffer has stride as a parameter");
      // }
      if (!accessor.count) {
        throw new Error("Accessor count of POSITION buffer should be defined for complementing NORMAL buffer");
      }
      const defaultAccessor = args.tf.accessors[args.primitive.indices];
      const defaultBufferView = args.tf.bufferViews[defaultAccessor.bufferView];
      // generate normal buffer
      const normal = new Float32Array(accessor.count * 3);
      if (defaultAccessor) {
        const bufferSource = args.bufferViews[defaultAccessor.bufferView];
        const byteAccessor = this.__getBufferReader(bufferSource,defaultAccessor.componentType,defaultAccessor.byteOffset,defaultBufferView.byteStride);
        for (let i = 0; i < accessor.count / 3; i++) {
          this._calcFlatNormal(positions, normal, byteAccessor(3 * i), byteAccessor(3 * i + 1,), byteAccessor(3 * i + 2));
        }
      } else {
        for (let i = 0; i < accessor.count / 3; i++) {
          this._calcFlatNormal(positions, normal, 3 * i, 3 * i + 1, 3 * i + 2);
        }
      }
      // add normal to geometry
      args.geometry.addAttributes(normal, {
        NORMAL: {
          size: 3
        }
      });
    }
    return false;
  }

  private _getElement(positions: Float32Array, posbase: number, elemIndex: number): number {
    return positions[posbase + elemIndex];
  }

  private _calcFlatNormal(positions: Float32Array, normals: Float32Array, i0: number, i1: number, i2: number): void {
    const v0Tov1 = new Vector3(this._getElement(positions, 3*i1, 0) - this._getElement(positions, 3*i0, 0), this._getElement(positions, 3*i1, 1) - this._getElement(positions, 3*i0, 1), this._getElement(positions, 3*i1, 2) - this._getElement(positions, 3*i0, 2));
    const v0Tov2 = new Vector3(this._getElement(positions, 3*i2, 0) - this._getElement(positions, 3*i0, 0), this._getElement(positions, 3*i2, 1) - this._getElement(positions, 3*i0, 1), this._getElement(positions, 3*i2, 2) - this._getElement(positions, 3*i0, 2));
    const nor = Vector3.cross(v0Tov1, v0Tov2).normalizeThis();
    normals[3 * i0] = nor.X;
    normals[3 * i0 + 1] = nor.Y;
    normals[3 * i0 + 2] = nor.Z;
    normals[3 * i1] = nor.X;
    normals[3 * i1 + 1] = nor.Y;
    normals[3 * i1 + 2] = nor.Z;
    normals[3 * i2] = nor.X;
    normals[3 * i2 + 1] = nor.Y;
    normals[3 * i2 + 2] = nor.Z;
  }
}
