interface GLTFAccessor {
  bufferView: string;
  byteOffset: number;
  byteStride: number;
  count: number;
  componentType: number;
  type: string;
  max?: number[];
  min?: number[];
}

export default GLTFAccessor;
