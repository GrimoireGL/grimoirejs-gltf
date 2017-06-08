import GLTF from "./Schema/GLTF";
import Geometry from "grimoirejs-fundamental/ref/Geometry/Geometry";
import Material from "grimoirejs-fundamental/ref/Material/Material";
import IAnimationRecipe from "grimoirejs-animation/ref/Animation/Schema/IAnimationRecipe";
interface InstanciationRecipe {
    tf: GLTF;
    primitives: { [key: string]: Geometry[] };
    materials: { [key: string]: Material };
    bufferViews: {[key:string]: ArrayBufferView };
    animations: {[key:string]: IAnimationRecipe};
}

export default InstanciationRecipe;
