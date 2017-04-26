import GLTFJointComponent from "./Components/GLTFJointComponent";
import GLTFAnimationComponent from "./Components/GLTFAnimationComponent";
import GLTFModelComponent from "./Components/GLTFModelComponent";
import GrimoireInterface from "grimoirejs";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import UniformResolverRegistry from "grimoirejs-fundamental/ref/Material/UniformResolverRegistry";
import gltfUnlit from "raw-loader!./Shaders/gltf-unlit.sort";
import gltfPBRMetalicRoughness from "raw-loader!./Shaders/gltf-pbr-metalic-roughness.sort";
import ImportResolver from "grimoirejs-fundamental/ref/Sort/ImportResolver";
import GLExtRequestor from "grimoirejs-fundamental/ref/Resource/GLExtRequestor";
export default () => {
    if (typeof ImportResolver.staticImports["forward-shading"] !== "string") {
        ImportResolver.staticImports["forward-shading"] = "";
    }
    GLExtRequestor.request("OES_standard_derivatives")
    GLExtRequestor.request("OES_element_index_uint")
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
            MaterialFactory.addSORTMaterial("gltf-pbr-metalic-roughness", gltfPBRMetalicRoughness);
            UniformResolverRegistry.add("JOINTMATRIX", (valInfo, material) => {
                return (proxy, info) => {
                    if (info.renderable.renderArgs["gltf-boneMatrices"]) {
                        proxy.uniformMatrixArray(valInfo.name, info.renderable.renderArgs["gltf-boneMatrices"]);
                    }
                };
            });
            UniformResolverRegistry.add("AMBIENT_COEFFICIENT", (valInfo, material) => {
                return (proxy, info) => {
                    const amb = info.sceneDescription["ambientCoefficient"];
                    proxy.uniformFloat(valInfo.name, amb || 0.1)
                };
            });
        }
    );
};
