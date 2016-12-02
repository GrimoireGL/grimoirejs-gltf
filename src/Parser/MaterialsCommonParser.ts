import GLTFConstantConvert from "./ConstantConverter";
import GLTF from "./Schema/GLTF";
export default class GLTFMaterialsCommonParser {
  public static parse(tf: GLTF, matKey: string, baseUrl: string) {

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
            result["texture"] = baseUrl + tf.images[tf.textures[matValues.diffuse].source].uri; // use sampler
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
