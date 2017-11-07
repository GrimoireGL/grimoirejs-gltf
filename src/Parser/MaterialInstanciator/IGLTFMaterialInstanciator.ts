import Material from "grimoirejs-fundamental/ref/Material/Material";
import GLTFMaterial from "../Schema/GLTFMaterial";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import GLTF from "../Schema/GLTF";
import Parser from "../Parser";
import Factory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
export default interface IGLTFMaterialInstanciator {
    tryInstanciate(matFactory: Factory, materialData: GLTFMaterial, textures: { [key: string]: Texture2D }, gltfData: GLTF, parser: Parser): Promise<Material | null>;
}