import { IAttributeDeclaration } from "grimoirejs/ref/Interface/IAttributeDeclaration";
import Component from "grimoirejs/ref/Core/Component";
import MeshRenderer from "grimoirejs-fundamental/ref/Components/MeshRendererComponent";
import MorphGeometry from "grimoirejs-fundamental/ref/Geometry/MorphGeometry";

export default class GLTFVertexMorpher extends Component {
    public static componentName = "GLTFVertexMorpher";
    public static attributes: { [key: string]: IAttributeDeclaration } = {
        weights: {
            default: [],
            converter: "NumberArray"
        }
    };

    private _meshComponent: MeshRenderer;

    private _morphTarget: MorphGeometry;
    public $mount(): void {
        this._meshComponent = this.node.getComponent(MeshRenderer);
        // this._meshComponent.geometry.then(g => this._morphTarget = g as MorphGeometry);
        // this.getAttributeRaw("weights").watch(v => {
        //     if (this._morphTarget) {
        //         this._morphTarget.setWeight(v);
        //     }
        // })
    }
}