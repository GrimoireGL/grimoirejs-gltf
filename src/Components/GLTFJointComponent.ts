import Matrix from "grimoirejs-math/ref/Matrix";
import GLTFSkin from "../Parser/Schema/GLTFSkin";
import TransformComponent from "grimoirejs-fundamental/ref/Components/TransformComponent";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import Component from "grimoirejs/ref/Node/Component";
import GLTFModelComponent from "./GLTFModelComponent";
export default class GLTFJointComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    invBindShapeMatrix: {  // invBindShapeMatrix passed during instanciation
      converter:"Object",
      default:null
    },
    skinIndex: {
      converter:"Number",
      default:null
    },
    jointIndex: {
      converter:"Number",
      default:null
    }
  };

  private _model:GLTFModelComponent;

  private _skinIndex:number;

  private _jointIndex:number;

  private _transform:TransformComponent;

  private _invBindMatrix: Matrix;

  public $mount(): void {
    this._model = this.node.getComponentInAncestor(GLTFModelComponent);
    this._transform = this.node.getComponent(TransformComponent);
    this._invBindMatrix = new Matrix(this.getAttribute("invBindShapeMatrix"));
    this._skinIndex = this.getAttribute("skinIndex");
    this._jointIndex = this.getAttribute("jointIndex");
  }

  public $update(): void {
     const poseMat = this._model.skeletons[this._skinIndex].globalTransformInverse.multiplyWith(this._transform.globalTransform).multiplyWith(this._invBindMatrix);//.multiplyWith(this._model.skeletons[this._skinIndex].globalTransform);
    for (let i = 0; i < 16; i++) {
      this._model.jointMatrices[this._skinIndex][this._jointIndex * 16 + i] = poseMat.rawElements[i];
    }
  }
}
