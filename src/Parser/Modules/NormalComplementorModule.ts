import ParserModule from "../ParserModule";
import {AddVertexAttributesArgument} from "../Arguments";
import Vector3 from "grimoirejs-math/ref/Vector3";
export default class NormalComplementorModule extends ParserModule{
  public complementVertexAttributes(args:AddVertexAttributesArgument):boolean{
    if(args.primitive.attributes["NORMAL"] === void 0&& args.primitive.attributes["POSITION"] !== void 0){
      const accessor = args.tf.accessors[args.primitive.attributes["POSITION"]];
      const baseBufferView = args.bufferViews[accessor.bufferView];
      const positions = new Float32Array(baseBufferView.buffer,baseBufferView.byteOffset + accessor.byteOffset);
      if(accessor.byteStride !== void 0 && accessor.byteStride !== 0){
        throw new Error("Complementing normal with a position buffer which buffer has stride as a parameter");
      }
      if(!accessor.count){
        throw new Error("Accessor count of POSITION buffer should be defined for complementing NORMAL buffer");
      }
      // generate normal buffer
      const normal = new Float32Array(accessor.count * 3);
      const p = (i,j,k)=>positions[9 * i + 3 * j + k]; // Get k th element of  j th vertices of i th surface
      for(let i = 0; i < accessor.count/3; i++){
        const v0Tov1 = new Vector3(p(i,1,0)-p(i,0,0),p(i,1,1)-p(i,0,1),p(i,1,2)-p(i,0,2));
        const v0Tov2 = new Vector3(p(i,2,0)- p(i,0,0),p(i,2,1)- p(i,0,1),p(i,2,2)- p(i,0,2));
        const nor = Vector3.cross(v0Tov1,v0Tov2).normalizeThis();
        for(let j = 0; j < 3; j++){
          const posBase = i * 9 + j * 3;
          normal[posBase + 0] = nor.X;
          normal[posBase + 1] = nor.Y;
          normal[posBase + 2] = nor.Z;
        }
      }
      // add normal to geometry
      args.geometry.addAttributes(normal,{
        NORMAL:{
          size:3
        }
      });
    }
    return false;
  }
}
