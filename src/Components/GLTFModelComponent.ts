import MeshRenderer from "grimoirejs-fundamental/ref/Components/MeshRendererComponent";
import TransformComponent from "grimoirejs-fundamental/ref/Components/TransformComponent";
import GLTFNode from "../Parser/Schema/GLTFNode";
import Matrix from "grimoirejs-math/ref/Matrix";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import GLTFParser from "../Parser/Parser";
import AssetLoader from "grimoirejs-fundamental/ref/Asset/AssetLoader";

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
        },
        waitForLoad:{
          converter: "Boolean",
          default: false
        }
    };

    private _assetRoot: GomlNode;

    public jointMatrices: { [skinName: string]: Float32Array } = {};

    public skeletons: {[skinName: string]: TransformComponent} = {};

    public $mount(): void {
        const src = this.getAttribute("src");
        if (src) {
            const gl: WebGLRenderingContext = this.companion.get("gl") as WebGLRenderingContext;
            const promise = GLTFParser.parseFromURL(gl, src).then((data) => {
                GLTFModelComponent.instanciator.instanciateAll(data,this,this.getAttribute("scene"));
            });
            if(this.getAttribute("waitForLoad")){
              const loader = this.companion.get("loader") as AssetLoader;
              loader.register(promise);
            }
        }
    }
}
