import Matrix from "grimoirejs-math/ref/Matrix";
import GLTFSkin from "../Parser/Schema/GLTFSkin";
import TransformComponent from "grimoirejs-fundamental/ref/Components/TransformComponent";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import Component from "grimoirejs/ref/Node/Component";
export default class GLTFJointComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    skinInfo: {
      converter: "Object",
      default: null
    },
    jointName: {
      converter: "String",
      default: null
    },
    skeletonTransform: {
      converter: "Object",
      default: null
    },
    jointMatrices: {
      converter: "Object",
      default: null
    }
  };

  private _transform: TransformComponent;

  private _skeletonTransform: TransformComponent;

  private _poseIndex: number;

  private _jointMatrices: Float32Array;

  private _invBindMatrix: Matrix;

  private _bindShapeMatrix: Matrix;

  public $mount(): void {
    this._transform = this.node.getComponent(TransformComponent);
    this._skeletonTransform = this.getAttribute("skeletonTransform");
    const skinInfo = this.getAttribute("skinInfo");
    this._poseIndex = skinInfo.jointNames.indexOf(this.getAttribute("jointName"));
    this._jointMatrices = this.getAttribute("jointMatrices");
    this._bindShapeMatrix = skinInfo.bindShapeMatrix;
    this._invBindMatrix = new Matrix(skinInfo.inverseBindMatrices.getByIndex(this._poseIndex));
  }

  public $update(): void {
    const poseMat = Matrix.inverse(this._skeletonTransform.globalTransform).multiplyWith(this._transform.globalTransform).multiplyWith(this._invBindMatrix).multiplyWith(this._bindShapeMatrix);
    for (let i = 0; i < 16; i++) {
      this._jointMatrices[this._poseIndex * 16 + i] = poseMat.rawElements[i];
    }
  }
}
