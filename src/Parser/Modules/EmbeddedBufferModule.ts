import ParserModule from "../ParserModule";
import GLTFBuffer from "../Schema/GLTFBuffer";
export default class EmbeddedBufferModule extends ParserModule{
  public loadBufferResource(tf: GLTFBuffer): Promise<ArrayBuffer> {
      if(this.__isDataUri(tf.uri)){
        return Promise.resolve(this.__dataUriToArrayBuffer(tf.uri));
      }
  }
}
