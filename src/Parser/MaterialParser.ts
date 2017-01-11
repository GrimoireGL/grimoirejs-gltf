import TechniqueRecipe from "grimoirejs-fundamental/ref/Material/ITechniqueRecipe";
import Material from "../../node_modules/grimoirejs-fundamental/ref/Material/Material";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import GLTFMaterial from "./Schema/GLTFMaterial";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import GLTFConstantConvert from "./ConstantConverter";
import ResourceResolver from "../Util/ResourceResolver";
import GLTF from "./Schema/GLTF";
export default class MaterialParser {
    public static async parse(tf: GLTF, matKey: string, ResourceResolver: ResourceResolver, textures: { [key: string]: Texture2D }): Promise<{ [key: string]: any }> {
        const material = tf.materials[matKey];
        if (material.extensions.KHR_materials_common) {
            return this._parseMaterialCommon(material, matKey, textures);
        }else{
          MaterialFactory.addMaterialType(matKey,(factory)=>{
            return new Material(factory.gl,this._convertIntoTechniqueRecipe(tf,matKey));
          });
        }
    }

    private static _convertIntoTechniqueRecipe(tf:GLTF,matKey:string):{[key:string]:TechniqueRecipe}{
      let techniqueRecipe:TechniqueRecipe = {} as TechniqueRecipe;
      const mat = tf.materials[matKey];
      const technique = tf.techniques[mat.technique];
      return {
        default:techniqueRecipe
      };
    }

    private static _parseMaterialCommon(material: GLTFMaterial, matKey: string, textures: { [key: string]: Texture2D }): { [key: string]: any } {
        const cmatData = material.extensions.KHR_materials_common;
        const matValues = cmatData.values;
        switch (cmatData.technique) {
            case "PHONG":
            case "BLINN":
                const result = {
                    type: "gltf-unlit",
                    class: "gltf-" + matKey
                };
                if (typeof matValues.diffuse === "string") {
                    result["texture"] = textures[matValues.diffuse];
                } else if (Array.isArray(matValues.diffuse)) {
                    result["diffuse"] = GLTFConstantConvert.asColorValue(matValues.diffuse);
                }
                return result;
            default:
                throw new Error(`Unsupported common material technique ${cmatData.technique}`);
        }
    }
}
