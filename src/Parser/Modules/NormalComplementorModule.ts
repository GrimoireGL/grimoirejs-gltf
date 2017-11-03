import ParserModule from "../ParserModule";
import { AddVertexAttributesArgument } from "../Arguments";
import Vector3 from "grimoirejs-math/ref/Vector3";
import ConstantConverter from "../ConstantConverter";
export default class NormalComplementorModule extends ParserModule {
  public complementVertexAttributes(args: AddVertexAttributesArgument): boolean {
    if (args.primitive.attributes["NORMAL"] === void 0 && args.primitive.attributes["POSITION"] !== void 0) {
      const positionAccessor = args.tf.accessors[args.primitive.attributes["POSITION"]];
      const positionBufferViewInfo = args.tf.bufferViews[positionAccessor.bufferView];
      const positionBufferView = args.bufferViews[positionAccessor.bufferView];
      const positionTypedArray = this.__convertBufferView(ConstantConverter.asTypedArrayConstructor(positionAccessor.componentType), positionBufferView, positionBufferViewInfo, positionAccessor);
      if (!positionAccessor.count) {
        throw new Error("Accessor count of POSITION buffer should be defined for complementing NORMAL buffer");
      }
      const indexAccessor = args.tf.accessors[args.primitive.indices];
      // generate normal buffer
      const complementedNormal = new Float32Array(positionAccessor.count * 3);
      if (indexAccessor) {
        const indexBufferViewInfo = args.tf.bufferViews[indexAccessor.bufferView];
        const indexBufferView = args.bufferViews[indexAccessor.bufferView];
        const indexTypedArray = this.__convertBufferView(ConstantConverter.asTypedArrayConstructor(indexAccessor.componentType), indexBufferView, indexBufferViewInfo, indexAccessor);
        for (let i = 0; i < indexAccessor.count / 3; i++) {
          this._calcFlatNormal(positionTypedArray, complementedNormal, indexTypedArray[3 * i], indexTypedArray[3 * i + 1], indexTypedArray[3 * i + 2]);
        }
      } else {
        for (let i = 0; i < positionAccessor.count / 3; i++) {
          this._calcFlatNormal(positionTypedArray, complementedNormal, 3 * i, 3 * i + 1, 3 * i + 2);
        }
      }
      // add normal to geometry
      args.geometry.addAttributes(complementedNormal, {
        NORMAL: {
          size: 3
        }
      });
    }
    return false;
  }

  private _getElement(positions: ArrayBufferView, posbase: number, elemIndex: number): number {
    return positions[posbase + elemIndex];
  }

  private _calcFlatNormal(positions: ArrayBufferView, normals: Float32Array, i0: number, i1: number, i2: number): void {
    const v0Tov1 = new Vector3(this._getElement(positions, 3 * i1, 0) - this._getElement(positions, 3 * i0, 0), this._getElement(positions, 3 * i1, 1) - this._getElement(positions, 3 * i0, 1), this._getElement(positions, 3 * i1, 2) - this._getElement(positions, 3 * i0, 2));
    const v0Tov2 = new Vector3(this._getElement(positions, 3 * i2, 0) - this._getElement(positions, 3 * i0, 0), this._getElement(positions, 3 * i2, 1) - this._getElement(positions, 3 * i0, 1), this._getElement(positions, 3 * i2, 2) - this._getElement(positions, 3 * i0, 2));
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
