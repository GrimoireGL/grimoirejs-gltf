export default class AccessorBase {

  private _getSingleByIndex: (index: number, indexOfElement: number) => number;

  private _resultMemoryCache: number[] = [];

  constructor(public bufffer: DataView, public count: number, public componentType: number, public elementSize: number, public byteOffset: number, public byteStride: number) {
    this._getSingleByIndex = this._generateSingleSamplerDelegate();
    this._resultMemoryCache = new Array(elementSize);
  }

  public getByIndex(index: number): number[] {
    for (let i = 0; i < this.elementSize; i++) {
      this._resultMemoryCache[i] = this._getSingleByIndex(index, i)
    }
    return this._resultMemoryCache;
  }

  private _generateSingleSamplerDelegate(): (index: number, indexOfElement: number) => number {
    switch (this.componentType) {
      case WebGLRenderingContext.FLOAT:
        return (index, indexOfElement) => this.bufffer.getFloat32(this.byteOffset + index * (4 * this.elementSize + this.byteStride) + indexOfElement * 4, true);
      case WebGLRenderingContext.INT:
        return (index, indexOfElement) => this.bufffer.getInt32(this.byteOffset + index * (4 * this.elementSize + this.byteStride) + indexOfElement * 4, true);
      case WebGLRenderingContext.SHORT:
        return (index, indexOfElement) => this.bufffer.getInt16(this.byteOffset + index * (2 * this.elementSize + this.byteStride) + indexOfElement * 2, true);
      case WebGLRenderingContext.BYTE:
        return (index, indexOfElement) => this.bufffer.getInt8(this.byteOffset + index * (1 * this.elementSize + this.byteStride) + indexOfElement * 1);
      case WebGLRenderingContext.UNSIGNED_INT:
        return (index, indexOfElement) => this.bufffer.getUint32(this.byteOffset + index * (4 * this.elementSize + this.byteStride) + indexOfElement * 4, true);
      case WebGLRenderingContext.UNSIGNED_SHORT:
        return (index, indexOfElement) => this.bufffer.getUint16(this.byteOffset + index * (2 * this.elementSize + this.byteStride) + indexOfElement * 2, true);
      case WebGLRenderingContext.UNSIGNED_BYTE:
        return (index, indexOfElement) => this.bufffer.getUint8(this.byteOffset + index * (1 * this.elementSize + this.byteStride) + indexOfElement * 1);
    }
  }
}
