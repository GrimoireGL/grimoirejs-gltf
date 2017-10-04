interface GLTFAccessor {
  bufferView: string;
  byteOffset: number;
  count: number;
  componentType: number;
  type: string;
  max?: number[];
  min?: number[];
}

export default GLTFAccessor;
