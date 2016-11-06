import GLTF from "./Schema/GLTF";
import Texture2D from "grimoirejs-fundamental/lib/Resource/Texture2D";
import Geometry from "grimoirejs-fundamental/lib/Geometry/Geometry";

interface ParsedGLTF {
  tf: GLTF;
  meshes: { [key: string]: Geometry };
  textures: { [key: string]: Texture2D };
  scene: {
    nodes: string[]
  };
  material: { [key: string]: any };
}

export default ParsedGLTF;
