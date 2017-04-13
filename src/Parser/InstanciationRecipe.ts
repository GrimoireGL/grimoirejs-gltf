import GLTF from "./Schema/GLTF";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import Material from "grimoirejs-fundamental/ref/Material/Material";
interface InstanciationRecipe {
    tf: GLTF;
    primitives: { [key: string]: Geometry[] };
    materials: { [key: string]: Material };
}

export default InstanciationRecipe;
