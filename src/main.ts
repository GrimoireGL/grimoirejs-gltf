import GLTFModelComponent from "./Components/GLTFModelComponent";
import GrimoireInterface from "grimoirejs";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import gltfUnlit from "raw!./Shaders/gltf-unlit.sort";
export default () => {
  GrimoireInterface.register(
    async () => {
      GrimoireInterface.registerComponent("GLTFModel", GLTFModelComponent);
      GrimoireInterface.registerNode("model", ["Transform", "GLTFModel"]);
      GrimoireInterface.registerNode("gltf-mesh", [], {
        material: "new(gltf-unlit)"
      }, "mesh");
      GrimoireInterface.registerNode("gltf-assets", [], {});
      MaterialFactory.addSORTMaterial("gltf-unlit", gltfUnlit);
    }
  );
}
