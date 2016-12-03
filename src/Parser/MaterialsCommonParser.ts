import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import GLTFConstantConvert from "./ConstantConverter";
import GLTF from "./Schema/GLTF";
export default class GLTFMaterialsCommonParser {
  public static parse(tf: GLTF, matKey: string, baseUrl: string, textures: { [key: string]: Texture2D }) {

    const material = tf.materials[matKey];
    if (material.extensions.KHR_materials_common) {
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
}
