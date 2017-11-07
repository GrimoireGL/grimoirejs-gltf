import IGLTFMaterialInstanciator from "./IGLTFMaterialInstanciator";
import GLTFMaterial from "../Schema/GLTFMaterial";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import GLTFAccessor from "../Schema/GLTFAccessor";
import GLTF from "../Schema/GLTF";
import GLTFParser from "../Parser";
import Material from "grimoirejs-fundamental/ref/Material/Material";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import TextureReference from "grimoirejs-fundamental/ref/Material/TextureReference";
import Pass from "grimoirejs-fundamental/ref/Material/Pass";

export default class DefaultPBRMetallicRoughnessInstanciator implements IGLTFMaterialInstanciator {
    async tryInstanciate(matFactory: MaterialFactory, materialData: GLTFMaterial, textures: { [key: string]: Texture2D; }, gltfData: GLTF, parser: GLTFParser): Promise<Material> {
        if (materialData["pbrMetallicRoughness"]) {
            const material = await matFactory.instanciate("gltf-pbr-metallic-roughness");
            const pass = material.techniques["default"].passes[0];
            this.__applyPBRMetallicRoughnessParameters(materialData, pass, textures);
            return material;
        } else {
            return null;
        }
    }


    protected __applyPBRMetallicRoughnessParameters(materialData: GLTFMaterial, pass: Pass, textures: { [key: string]: Texture2D; }) {
        const pmr = materialData["pbrMetallicRoughness"];
        if (pmr.baseColorFactor) {
            pass.setArgument("baseColorFactor", pmr.baseColorFactor, null);
        }
        if (pmr.baseColorTexture) {
            pass.setArgument("baseColorTexture", new TextureReference(textures[pmr.baseColorTexture.index]), null);
        }
        if (pmr.metallicFactor) {
            pass.setArgument("metallicFactor", pmr.metallicFactor, null);
        }
        // TODO Remove? metallicTexture and roughnessTexture was removed from specification?
        if ((pmr as any).metallicTexture) {
            pass.setArgument("metallicTexture", new TextureReference(textures[(pmr as any).metallicTexture.index]), null);
        }
        if ((pmr as any).roughnessTexture) {
            pass.setArgument("roughnessTexture", new TextureReference(textures[(pmr as any).roughnessTexture.index]), null);
        }
        if (pmr.roughnessFactor) {
            pass.setArgument("roughnessFactor", pmr.roughnessFactor, null);
        }
        if (pmr.metallicRoughnessTexture) {
            pass.setArgument("metallicRoughnessTexture", new TextureReference(textures[pmr.metallicRoughnessTexture.index]), null);
        }
        if (materialData["emissiveFactor"]) {
            pass.setArgument("emissiveFactor", materialData.emissiveFactor, null);
        }
        if (materialData["emissiveTexture"]) {
            pass.setArgument("emissiveTexture", new TextureReference(textures[materialData.emissiveTexture.index]), null);
        }
        if (materialData["normalTexture"]) {
            pass.setArgument("normalTexture", new TextureReference(textures[materialData.normalTexture.index]), null);
        }
        if (materialData["occlusionTexture"]) {
            pass.setArgument("occlusionTexture", new TextureReference(textures[materialData.occlusionTexture.index]), null);
        } if (pmr.baseColorTexture) {
            pass.setArgument("baseColorTexture", new TextureReference(textures[pmr.baseColorTexture.index]), null);
        }
        if (pmr.metallicFactor) {
            pass.setArgument("metallicFactor", pmr.metallicFactor, null);
        }
        // TODO Remove? metallicTexture and roughnessTexture was removed from specification?
        if ((pmr as any).metallicTexture) {
            pass.setArgument("metallicTexture", new TextureReference(textures[(pmr as any).metallicTexture.index]), null);
        }
        if ((pmr as any).roughnessTexture) {
            pass.setArgument("roughnessTexture", new TextureReference(textures[(pmr as any).roughnessTexture.index]), null);
        }
        if (pmr.roughnessFactor) {
            pass.setArgument("roughnessFactor", pmr.roughnessFactor, null);
        }
        if (pmr.metallicRoughnessTexture) {
            pass.setArgument("metallicRoughnessTexture", new TextureReference(textures[pmr.metallicRoughnessTexture.index]), null);
        }
        if (materialData["emissiveFactor"]) {
            pass.setArgument("emissiveFactor", materialData.emissiveFactor, null);
        }
        if (materialData["emissiveTexture"]) {
            pass.setArgument("emissiveTexture", new TextureReference(textures[materialData.emissiveTexture.index]), null);
        }
        if (materialData["normalTexture"]) {
            pass.setArgument("normalTexture", new TextureReference(textures[materialData.normalTexture.index]), null);
        }
        if (materialData["occlusionTexture"]) {
            pass.setArgument("occlusionTexture", new TextureReference(textures[materialData.occlusionTexture.index]), null);
        }
    }
}