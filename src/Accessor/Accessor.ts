import ConstantConverter from "../Parser/ConstantConverter";
/**
 * The accessor class to be used for fetching animation frames
 */
export default class Accessor {
  private _resultMemoryCache: number[] = [];

  private _dView: DataView;

  private _elementByteSize: number;

  constructor(public buffer: ArrayBufferView, public count: number, public componentType: number, public elementSize: number, public byteOffset: number, public byteStride: number) {
    this._resultMemoryCache = new Array(elementSize);
    this._dView = new DataView(buffer.buffer, buffer.byteOffset + byteOffset);
    this._elementByteSize = ConstantConverter.asByteSize(componentType);
  }

  public getByIndex(index: number): number[] {
    for (let i = 0; i < this.elementSize; i++) {
      this._resultMemoryCache[i] = this._getSingleByIndex(index, i)
    }
    return this._resultMemoryCache;
  }

  private _getSingleByIndex(index: number, elementIndex: number): number {
    switch (this.componentType) {
      case WebGLRenderingContext.FLOAT:
        return this._dView.getFloat32(index * (this.elementSize * this._elementByteSize + this.byteStride) + this._elementByteSize * elementIndex, true);
      default:
        throw new Error("Unsupported element type");
    }
  }
}
