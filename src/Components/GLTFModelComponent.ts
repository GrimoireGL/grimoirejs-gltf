import Matrix from "grimoirejs-math/ref/Matrix";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import ParsedGLTF from "../Parser/ParsedGLTF";
import Component from "grimoirejs/ref/Node/Component";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import GLTFParser from "../Parser/GLTFParser";


export default class GLTFModelComponent extends Component {

  public static componentName: string = "GLTFModelComponent";

  public static attributes: { [key: string]: IAttributeDeclaration } = {
    src: {
      converter: "String",
      defaultValue: null
    },
    scene: {
      converter: "String",
      defaultValue: null
    }
  };

  public $mount(): void {
    const src = this.getValue("src");
    if (src) {
      const gl: WebGLRenderingContext = this.companion.get("gl") as WebGLRenderingContext;
      GLTFParser.parseFromURL(gl, src).then((data) => {
        this._populateAssets(data);
        this._populateScene(data);
      });
    }
  }

  private _populateScene(data: ParsedGLTF): void {
    let sceneName = this.getValue("scene");
    if (!sceneName) {
      sceneName = data.tf.scene;
    }
    const sceneNodes = data.tf.scenes[sceneName];
    for (let nodeName of sceneNodes.nodes) {
      this._populateNode(data, nodeName, this.node);
    }
  }

  private _populateAssets(data: ParsedGLTF): void {
    const assetRoot = this.node.addChildByName("gltf-assets", {});
    for (let key in data.materials) {
      const node = assetRoot.addChildByName("material", data.materials[key]);
      node.element.className = data.materials[key]["class"]; // hack for bug
    }
  }

  private _populateNode(data: ParsedGLTF, nodeName: string, parentNode: GomlNode): void {
    const node = data.tf.nodes[nodeName];
    let gomlNode;
    if (node.meshes !== void 0) {
      const mesh = data.meshes[node.meshes[0]];
      // instanciate the mesh
      gomlNode = parentNode.addChildByName("gltf-mesh", {
        geometry: mesh,
        material: ".gltf-" + data.tf.meshes[node.meshes[0]].primitives[0].material
      });
    } else {
      gomlNode = parentNode.addChildByName("object", {});
    }
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
      gomlNode.setAttribute("position", mat.getTranslation());
      gomlNode.setAttribute("scale", mat.getScaling());
      gomlNode.setAttribute("rotation", mat.getRotation());
    }
    if (node.children) {
      for (let chNodeName of node.children) {
        this._populateNode(data, chNodeName, gomlNode);
      }
    }
  }
}
