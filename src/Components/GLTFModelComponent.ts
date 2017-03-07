import MeshRenderer from "grimoirejs-fundamental/ref/Components/MeshRendererComponent";
import TransformComponent from "grimoirejs-fundamental/ref/Components/TransformComponent";
import GLTFNode from "../Parser/Schema/GLTFNode";
import Animation from "../Animation/Animation";
import Matrix from "grimoirejs-math/ref/Matrix";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import ParsedGLTF from "../Parser/ParsedGLTF";
import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import GLTFParser from "../Parser/Parser";


export default class GLTFModelComponent extends Component {
    public static componentName: string = "GLTFModelComponent";

    public static attributes: { [key: string]: IAttributeDeclaration } = {
        src: {
            converter: "String",
            default: null
        },
        scene: {
            converter: "String",
            default: null
        }
    };

    private _assetRoot: GomlNode;

    private _parsedData: ParsedGLTF;

    private _jointMatrices: { [skinName: string]: Float32Array } = {};

    public $mount(): void {
        const src = this.getAttribute("src");
        if (src) {
            const gl: WebGLRenderingContext = this.companion.get("gl") as WebGLRenderingContext;
            GLTFParser.parseFromURL(gl, src).then((data) => {
                this._parsedData = data;
                this._populateAssets(data);
                this._populateScene(data);
            });
        }
    }

    private _populateScene(data: ParsedGLTF): void {
        let sceneName = this.getAttribute("scene");
        if (!sceneName) {
            sceneName = data.tf.scene;
        }
        const sceneNodes = data.tf.scenes[sceneName];
        for (let nodeName of sceneNodes.nodes) {
            this._populateNode(data, nodeName, this.node);
        }
    }

    private _populateAssets(data: ParsedGLTF): void {
        this._assetRoot = this.node.addChildByName("gltf-assets", {});
        for (let key in data.animations) {
            this._assetRoot.addChildByName("gltf-animation", {
                animation: data.animations[key],
            });
        }
    }

    private _populateMaterial(data: ParsedGLTF, materialName: string, jointCount: number): string {
        const query = `gltf-${data.tf.id}-${materialName}`;
        const matNodes = this.node.getChildrenByClass(query);
        if (matNodes.length === 0) {
            const args = data.materials[materialName];
            args["class"] = query;
            args["jointCount"] = jointCount;
            const mat = this._assetRoot.addChildByName("material", args);
        }
        return "." + query;
    }

    private _populateNode(data: ParsedGLTF, nodeName: string, parentNode: GomlNode): void {
        const node = data.tf.nodes[nodeName];
        if (node.skin) {
            // adjust skin to node
            parentNode = parentNode.addChildByName("object", {});
        }
        const gomlNode = parentNode.addChildByName("object", {});
        gomlNode.element.className = nodeName;
        if (node.meshes !== void 0) {
            for (let i = 0; i < node.meshes.length; i++) {
                const mesh = data.meshes[node.meshes[i]];
                for (let j = 0; j < mesh.length; j++) {
                    const materialName = data.tf.meshes[node.meshes[i]].primitives[j].material;
                    const exts = data.tf.materials[materialName].extensions;
                    const noUseAlpha = exts && exts.KHR_materials_common && !exts.KHR_materials_common.transparent;
                    const matquery = this._populateMaterial(data, materialName, node.skin ?  data.skins[node.skin].jointCount : 0);
                    const meshNode = gomlNode.addChildByName("gltf-mesh", {
                        geometry: mesh[j],
                        material: matquery,
                        drawOrder: noUseAlpha ? "NoAlpha" : "UseAlpha"
                    });
                    if (node.skin) {
                        const skinName = node.skin;
                        const meshRenderer = meshNode.getComponent(MeshRenderer);
                        if (skinName && this._jointMatrices[skinName] === void 0) {
                            this._jointMatrices[skinName] = new Float32Array(16 * data.skins[skinName].jointCount);
                        }
                        meshRenderer.renderArgs["gltf-boneMatrices"] = this._jointMatrices[skinName];
                    }
                }
            }
        }
        this._applyTransform(node, gomlNode);
        if (node.children) {
            for (let chNodeName of node.children) {
                this._populateNode(data, chNodeName, gomlNode);
            }
        }
        if (node.skeletons && node.skin) {
            for (let i = 0; i < node.skeletons.length; i++) {
                const jointNode = this.node.getChildrenByClass(node.skeletons[i]);
                this._injectJoint(data, jointNode[0], node.skeletons[i], gomlNode.getComponent(TransformComponent), node.skin);
            }
        }
    }

    private _injectJoint(data: ParsedGLTF, gomlNode: GomlNode, nodeName: string, skeletonTransform: TransformComponent, skinName: string): void {
        gomlNode.addComponent("GLTFJoint", {
            skinInfo: data.skins[skinName],
            jointName: data.tf.nodes[nodeName].jointName,
            skeletonTransform: skeletonTransform,
            jointMatrices: this._jointMatrices[skinName]
        });
        if (data.tf.nodes[nodeName].children) {
            const node = data.tf.nodes[nodeName];
            for (let i = 0; i < node.children.length; i++) {
                const jointNode = this.node.getChildrenByClass(node.children[i]);
                this._injectJoint(data, jointNode[0], node.children[i], skeletonTransform, skinName);
            }
        }
    }



    private _applyTransform(node: GLTFNode, gomlNode: GomlNode): void {
        if (node.translation) {
            gomlNode.setAttribute("position", node.translation);
        }
        if (node.scale) {
            gomlNode.setAttribute("scale", node.scale);
        }
        if (node.rotation) {
            gomlNode.setAttribute("rotation", node.rotation);
        }
        if (node.matrix) {
            const mat = new Matrix(node.matrix);
            gomlNode.setAttribute("rawMatrix", mat);
        }
    }
}
