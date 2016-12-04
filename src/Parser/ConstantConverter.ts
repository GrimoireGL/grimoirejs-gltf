import Color3 from "grimoirejs-math/ref/Color3";
import Color4 from "grimoirejs-math/ref/Color4";
export default class GLTFConstantConvert {
  public static asColorValue(a: number[]): Color4 | Color3 {
    if (a.length === 3) {
      return new Color3(a[0], a[1], a[2]);
    } else {
      return new Color4(a[0], a[1], a[2], a[3]);
    }
  }

  public static asVectorSize(type: string): number {
    switch (type) {
      case "SCALAR":
        return 1;
      case "VEC2":
        return 2;
      case "VEC3":
        return 3;
      case "VEC4":
        return 4;
      default:
        throw new Error("Invalid vectorSize");
    }
  }

  public static asByteSize(componentType: number): number {
    switch (componentType) {
      case WebGLRenderingContext.UNSIGNED_BYTE:
      case WebGLRenderingContext.BYTE:
        return 1;
      case WebGLRenderingContext.UNSIGNED_SHORT:
      case WebGLRenderingContext.SHORT:
        return 2;
      case WebGLRenderingContext.UNSIGNED_INT:
      case WebGLRenderingContext.INT:
      case WebGLRenderingContext.FLOAT:
        return 4;
      default:
        throw new Error("Unknown size!");
    }
  }

  public static elementTypeToTypedArray(type: number): new (arr: ArrayBuffer, offset?: number, length?: number) => BufferSource {
    switch (type) {
      case WebGLRenderingContext.UNSIGNED_BYTE:
        return Uint8Array;
      case WebGLRenderingContext.BYTE:
        return Int8Array;
      case WebGLRenderingContext.UNSIGNED_SHORT:
        return Uint16Array;
      case WebGLRenderingContext.SHORT:
        return Int16Array;
      case WebGLRenderingContext.UNSIGNED_INT:
        return Uint32Array;
      case WebGLRenderingContext.INT:
        return Int32Array;
      case WebGLRenderingContext.FLOAT:
        return Float32Array;
      default:
        throw new Error("Unsupported");
    }
  }

  public static indexCountToBufferInfo(count: number): {
    elementType: number,
    byteSize: number,
    ctor: new (length: number) => any
  } {
    if (count < 256) {
      return {
        elementType: WebGLRenderingContext.UNSIGNED_BYTE,
        byteSize: 1,
        ctor: Uint8Array
      };
    } else if (count < 65536) {
      return {
        elementType: WebGLRenderingContext.UNSIGNED_SHORT,
        byteSize: 2,
        ctor: Uint16Array
      };
    } else {
      return {
        elementType: WebGLRenderingContext.UNSIGNED_INT,
        byteSize: 4,
        ctor: Uint32Array
      };
    }
  }

  public static asGrAttribName(bufferName: string): string {
    switch (bufferName) {
      case "POSITION":
        return "position";
      case "NORMAL":
        return "normal";
      case "TEXCOORD_0":
        return "texCoord";
      case "JOINT":
        return "joint";
      case "WEIGHT":
        return "weight";
      default:
        throw new Error("Unknown semantic" + bufferName);
    }
  }

}
