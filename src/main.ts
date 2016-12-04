import GLTFAnimationComponent from "./Components/GLTFAnimationComponent";
import GLTFModelComponent from "./Components/GLTFModelComponent";
import GrimoireInterface from "grimoirejs";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import gltfUnlit from "raw!./Shaders/gltf-unlit.sort";
export default () => {
  GrimoireInterface.register(
    async () => {
      GrimoireInterface.registerComponent("GLTFModel", GLTFModelComponent);
      GrimoireInterface.registerComponent("GLTFAnimation", GLTFAnimationComponent);
      GrimoireInterface.registerNode("model", ["GLTFModel"], {}, "object");
      GrimoireInterface.registerNode("gltf-mesh", [], {
        material: "new(gltf-unlit)"
      }, "mesh");
      GrimoireInterface.registerNode("gltf-assets", [], {});
      GrimoireInterface.registerNode("gltf-animation", ["GLTFAnimation"], {});
      MaterialFactory.addSORTMaterial("gltf-unlit", gltfUnlit);
    }
  );
}
