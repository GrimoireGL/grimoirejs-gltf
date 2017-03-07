import GLTFJointComponent from "./Components/GLTFJointComponent";
import GLTFAnimationComponent from "./Components/GLTFAnimationComponent";
import GLTFModelComponent from "./Components/GLTFModelComponent";
import GrimoireInterface from "grimoirejs";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import UniformResolverRegistry from "grimoirejs-fundamental/ref/Material/UniformResolverRegistry";
import gltfUnlit from "raw-loader!./Shaders/gltf-unlit.sort";
export default () => {
  GrimoireInterface.register(
    async () => {
      GrimoireInterface.registerComponent("GLTFModel", GLTFModelComponent);
      GrimoireInterface.registerComponent("GLTFAnimation", GLTFAnimationComponent);
      GrimoireInterface.registerComponent("GLTFJoint", GLTFJointComponent);
      GrimoireInterface.registerNode("model", ["GLTFModel"], {}, "object");
      GrimoireInterface.registerNode("gltf-mesh", [], {
        material: "new(gltf-unlit)"
      }, "mesh");
      GrimoireInterface.registerNode("gltf-joint", ["GLTFJoint"], {}, "object");
      GrimoireInterface.registerNode("gltf-assets", [], {});
      GrimoireInterface.registerNode("gltf-animation", ["GLTFAnimation"], {});
      MaterialFactory.addSORTMaterial("gltf-unlit", gltfUnlit);
      UniformResolverRegistry.add("JOINTMATRIX", (valInfo , material) => {
        material.addArgument("boneMatrices", {
          converter: "Object",
          default: null
        });
        return (proxy, info) => {
          proxy.uniformMatrixArray(valInfo.name, info.renderable.renderArgs["gltf-boneMatrices"]);
        };
      });
    }
  );
};
