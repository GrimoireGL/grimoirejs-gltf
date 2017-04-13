interface GLTFNode {
  children: string[];
  matrix: number[];
  translation: number[];
  rotation: number[];
  scale: number[];
  mesh?:string;
  name: string;
  skin: string;
  skeletons: string[];
  jointName: string;
}

export default GLTFNode;
