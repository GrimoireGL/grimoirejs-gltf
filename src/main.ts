import GLTFJointComponent from "./Components/GLTFJointComponent";
import GLTFModelComponent from "./Components/GLTFModelComponent";
import GrimoireInterface from "grimoirejs";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import UniformResolverRegistry from "grimoirejs-fundamental/ref/Material/UniformResolverRegistry";
import gltfUnlit from "raw-loader!./Shaders/gltf-unlit.sort";
import gltfPBRMetallicRoughness from "raw-loader!./Shaders/gltf-pbr-metallic-roughness.sort";
import ImportResolver from "grimoirejs-fundamental/ref/Sort/ImportResolver";
import GLExtRequestor from "grimoirejs-fundamental/ref/Resource/GLExtRequestor";
import GLTFVertexMorpher from "./Components/GLTFVertexMorpher";
export default () => {
    if (typeof ImportResolver.staticImports["forward-shading"] !== "string") {
        ImportResolver.staticImports["forward-shading"] = "";
    }
    GLExtRequestor.request("OES_standard_derivatives")
    GLExtRequestor.request("OES_element_index_uint")
    GrimoireInterface.register(
        async () => {
            GrimoireInterface.registerComponent("GLTFModel", GLTFModelComponent);
            GrimoireInterface.registerComponent("GLTFJoint", GLTFJointComponent);
            GrimoireInterface.registerComponent("GLTFVertexMorpher",GLTFVertexMorpher);
            GrimoireInterface.registerNode("model", ["GLTFModel"], {}, "object");
            GrimoireInterface.registerNode("gltf-mesh", [], {
                material: "new(gltf-unlit)"
            }, "mesh");
            GrimoireInterface.registerNode("gltf-joint", ["GLTFJoint"], {}, "object");
            GrimoireInterface.registerNode("gltf-assets", [], {});
            MaterialFactory.addSORTMaterial("gltf-unlit", gltfUnlit);
            MaterialFactory.addSORTMaterial("gltf-pbr-metallic-roughness", gltfPBRMetallicRoughness);
            UniformResolverRegistry.add("JOINTMATRIX", (valInfo, material) => {
                return (proxy, info) => {
                    if (info.renderable.renderArgs["gltf-jointMatrices"]) {
                        proxy.uniformMatrixArray(valInfo.name, info.renderable.renderArgs["gltf-jointMatrices"]);
                    }
                };
            });
        }
    );
};
