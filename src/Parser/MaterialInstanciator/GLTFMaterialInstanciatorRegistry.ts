import IGLTFMaterialInstanciator from "./IGLTFMaterialInstanciator";
import GLTFMaterial from "../Schema/GLTFMaterial";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import GLTF from "../Schema/GLTF";
import Parser from "../Parser";
import Material from "grimoirejs-fundamental/ref/Material/Material";
import GLRelatedRegistryBase from "grimoirejs-fundamental/ref/Resource/GLRelatedRegistryBase";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import DefaultPBRMetallicRoughnessInstanciator from "./DefaultPBRMetallicRoughnessInstanciator";
export default class GLTFMaterialInstanciatorRegistry extends GLRelatedRegistryBase {

    public static instanciators: IGLTFMaterialInstanciator[] = [new DefaultPBRMetallicRoughnessInstanciator()];

    public static registryName = "gltf-material-instanciator";

    public static get(gl: WebGLRenderingContext): GLTFMaterialInstanciatorRegistry {
        return this.__get(gl, GLTFMaterialInstanciatorRegistry);
    }

    constructor(public gl: WebGLRenderingContext) {
        super();
    }

    public async getInstanciator(materialData: GLTFMaterial, textures: { [key: string]: Texture2D }, gltfData: GLTF, parser: Parser): Promise<Material> {
        const matFactory = MaterialFactory.get(this.gl);
        for (let i = 0; i < GLTFMaterialInstanciatorRegistry.instanciators.length; i++) {
            const instanciator = GLTFMaterialInstanciatorRegistry.instanciators[GLTFMaterialInstanciatorRegistry.instanciators.length - 1 - i];
            const material = await instanciator.tryInstanciate(matFactory, materialData, textures, gltfData, parser);
            if (material) {
                return material;
            }
        }
        throw new Error("Can't find any material for specified model." + JSON.stringify(materialData));
    }
}