import Accessor from "../Accessor/Accessor";
import Matrix from "grimoirejs-math/ref/Matrix";
import Animation from "./Schema/GLTFAnimation";
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
  animations: { [key: string]: Animation; };
  skins: {
    [key: string]: {
      bindShapeMatrix: Matrix,
      jointNames: string[],
      inverseBindMatrices: Accessor,
      jointMatrices: Float32Array
    }
  }
}

export default ParsedGLTF;
