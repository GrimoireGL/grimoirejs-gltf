import GLTFModelComponent from "./Components/GLTFModelComponent";
import GrimoireInterface from "grimoirejs";
export default () => {
  GrimoireInterface.register(
    async () => {
      GrimoireInterface.registerComponent("GLTFModel", GLTFModelComponent);
      GrimoireInterface.registerNode("model", ["Transform", "GLTFModel"]);
      GrimoireInterface.registerNode("gltf-mesh", ["Transform", "MaterialContainer", "MeshRenderer"]);
    }
  );
}
