import ParsedGLTF from "../Parser/ParsedGLTF";
import Component from "grimoirejs/lib/Node/Component";
import IAttributeDeclaration from "grimoirejs/lib/Node/IAttributeDeclaration";
import GLTFParser from "../Parser/GLTFParser";


export default class GLTFModelComponent extends Component {

  public static componentName: string = "GLTFModelComponent";

  public static attributes: { [key: string]: IAttributeDeclaration } = {
    src: {
      converter: "String",
      defaultValue: undefined
    }
  };

  public $mount(): void {
    const src = this.getValue("src");
    if (src) {
      const gl: WebGLRenderingContext = this.companion.get("gl") as WebGLRenderingContext;
      GLTFParser.parseFromURL(gl, src).then((data) => {
        this._populateChildren(data);
      });
    }
  }

  private _populateChildren(data: ParsedGLTF): void {
    for (let nodeName of data.scene.nodes) {
      const node = data.tf.nodes[nodeName];
      if (node.meshes !== void 0) {
        const mesh = data.meshes[node.meshes[0]];
        // instanciate the mesh
        this.node.addChildByName("gltf-mesh", {
          geometry: mesh,
          material: "new(gltf)",
          texture: data.textures[data.material[mesh["materialName"]].texture]
        });
      }
    }
  }
}
