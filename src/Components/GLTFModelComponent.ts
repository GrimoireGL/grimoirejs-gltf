import MeshRenderer from "grimoirejs-fundamental/ref/Components/MeshRendererComponent";
import TransformComponent from "grimoirejs-fundamental/ref/Components/TransformComponent";
import GLTFNode from "../Parser/Schema/GLTFNode";
import Animation from "../Animation/Animation";
import Matrix from "grimoirejs-math/ref/Matrix";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import GLTFParser from "../Parser/Parser";

import DefaultInstanciator from "../Instanciator/DefaultInstanciator";

export default class GLTFModelComponent extends Component {
    public static instanciator = new DefaultInstanciator();

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

    private _jointMatrices: { [skinName: string]: Float32Array } = {};

    public $mount(): void {
        const src = this.getAttribute("src");
        if (src) {
            const gl: WebGLRenderingContext = this.companion.get("gl") as WebGLRenderingContext;
            GLTFParser.parseFromURL(gl, src).then((data) => {
                GLTFModelComponent.instanciator.instanciateAll(data,this.node,this.getAttribute("scene"));
            });
        }
    }
}
