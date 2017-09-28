import IAttributeDeclaration from "grimoirejs/ref/Node/IAttributeDeclaration";
import Component from "grimoirejs/ref/Node/Component";

export default class GLTFVertexMorpher extends Component{
    public static attributes: { [key: string]: IAttributeDeclaration } = {
        weights:{
            default:[],
            converter:"NumberArray"
        }
    };
    
}