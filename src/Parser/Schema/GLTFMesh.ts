interface GLTFMesh {
  name: string;
  primitives: {
    attributes: { [semantic: string]: string };
    indices: string;
    material: string;
    mode: number;
  }[];
}

export default GLTFMesh;
