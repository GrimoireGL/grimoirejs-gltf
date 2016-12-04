import GLTF from "./Schema/GLTF";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";

interface ParsedGLTF {
  tf: GLTF;
  meshes: { [key: string]: Geometry[] };
  textures: { [key: string]: Texture2D };
  materials: {
    [key: string]: {
      type: string;
      [key: string]: any;
    }
  };
}

export default ParsedGLTF;
