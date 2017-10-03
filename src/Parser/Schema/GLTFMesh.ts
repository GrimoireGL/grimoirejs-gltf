import GLTFPrimitive from "./GLTFPrimitive";
interface GLTFMesh {
  name: string;
  primitives: GLTFPrimitive[];
  weights?:number[];
}

export default GLTFMesh;
