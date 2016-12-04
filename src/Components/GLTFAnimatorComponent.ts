import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import Component from "grimoirejs/ref/Node/Component";
export default class GLTFAnimatorComponent extends Component {
  public static attributes: { [key: string]: IAttributeDeclaration } = {
    play: {
      converter: "Boolean",
      defaultValue: false
    }
  };

  public $mount(): void {

  }

  public $update(): void {

  }

  public $unmount(): void {

  }
}
