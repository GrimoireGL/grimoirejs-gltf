import ParserModule from "../ParserModule";
import {AppendIndicesArgument} from "../Arguments";
import Vector3 from "grimoirejs-math/ref/Vector3";
export default class IndexComplementorModule extends ParserModule{
  public appendIndices(args: AppendIndicesArgument): boolean {
      if (args.primitive.indices === void 0) {
          const topology = args.primitive.mode || WebGLRenderingContext.TRIANGLES;
          const accessor = args.tf.accessors[args.primitive.attributes["POSITION"]];
          if(accessor.count === void 0){
            throw new Error("POSITION buffer should have count parameter. Construction of index buffer was failed.");
          }
          if(topology !== WebGLRenderingContext.TRIANGLES){
            throw new Error("Complementing index buffer is only supported for TRIANGLES topology currently.");
          }
          const indices = new Array(accessor.count);
          for(let i = 0; i < accessor.count; i++){
            indices[i] = i;
          }
          args.geometry.addIndex("default",indices);
          return true;
      }
  }
}
