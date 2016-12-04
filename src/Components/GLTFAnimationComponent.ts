import Animation from "../Animation/Animation";
import TransformComponent from "grimoirejs-fundamental/ref/Components/TransformComponent";
import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import Component from "grimoirejs/ref/Node/Component";
export default class GLTFAnimationComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    play: {
      converter: "Boolean",
      defaultValue: false
    },
    animation: {
      converter: "Object",
      defaultValue: null
    }
  };

  private _targetTransforms: { [key: string]: TransformComponent };

  private _startTime: number;

  private _animation: Animation;

  public $mount(): void {
    this._startTime = (new Date()).getTime();
    this._animation = this.getValue("animation");
  }

  public $update(): void {
    if (!this._targetTransforms) {
      this._targetTransforms = {};
      const targets = this._animation.targetNodes;
      for (let target of targets) {
        const nodes = this.node.parent.parent.parent.getChildrenByClass(target);
        this._targetTransforms[target] = nodes[0].getComponent("Transform") as TransformComponent;
      }
    }
    const t = ((new Date()).getTime() - this._startTime) / 1000;
    this._animation.processCurrentFrame(t % 3, (id, path, v) => {
      const transform = this._targetTransforms[id];
      switch (path) {
        case "translation":
          transform.localPosition.rawElements = v;
          break;
        case "rotation":
          transform.localRotation.rawElements = v;
          break;
      }
      transform.updateTransform();
    });
  }

  public $unmount(): void {

  }
}