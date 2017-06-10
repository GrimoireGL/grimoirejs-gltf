import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
/**
 * Base class of ParserModule.
 * Provides utility for parsing glTF files.
 */
export default class ParserModuleBase {

  protected __fetchBuffer(url: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "arraybuffer";
      xhr.onload = (v) => {
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        reject({
          message: `Loading resource at '${url} failed. Is there resource file in dependency at correct location?'`,
          error: e
        });
      };
      xhr.send();
    });
  }

  protected __fetchImage(url: string): Promise<HTMLImageElement> {
    return ImageResolver.resolve(url);
  }

  /**
   * Check provided string being data uri or not.
   * @param  {string}  target [description]
   * @return {boolean}        [description]
   */
  protected __isDataUri(target: string): boolean {
    return !!target.match(/^\s*data\:.*;base64/);
  }

  /**
   * Get directiory location from specified url
   * @param  {string} url [description]
   * @return {string}     [description]
   */
  protected __getBaseDir(url: string): string {
    return url.substr(0, url.lastIndexOf("/") + 1);
  }

  /**
   * Convert dataURI text to raw text
   * @param  {string} dataUrl [description]
   * @return {string}         [description]
   */
  protected __dataUriToText(dataUrl: string): string {
    const splittedUri = dataUrl.split(",");
    const byteString = atob(splittedUri[1]);
    return byteString;
  }

  /**
   * Convert data url string into array buffer
   * @param  {string}      dataUri [description]
   * @return {ArrayBuffer}         [description]
   */
  protected __dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
    const splittedUri = dataUri.split(",");
    const byteString = atob(splittedUri[1]);
    const byteStringLength = byteString.length;
    const arrayBuffer = new ArrayBuffer(byteStringLength);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteStringLength; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return arrayBuffer;
  }

  /**
   * Convert data uri into image element
   * @param  {string}  dataUrl [description]
   * @return {Promise}         [description]
   */
  protected __dataUriToImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = dataUrl;
      image.onload = () => {
        resolve(image);
      };
    });
  }

  protected __bufferToString(arr: ArrayBuffer): string {
    let tmp = "";
    let len = 1024;
    for (let p = 0; p < arr.byteLength; p += len) {
      tmp += this._smallBufferToString(new Uint8Array(arr.slice(p, p + len)));
    }
    return tmp;
  }

  protected __getBufferReader(arr: ArrayBufferView, type: number = WebGLRenderingContext.UNSIGNED_BYTE, offset: number = 0, stride: number = 0): (i: number) => number {
    let singleByte = 0;
    switch (type) {
      case WebGLRenderingContext.UNSIGNED_BYTE:
        arr = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
        break;
      case WebGLRenderingContext.UNSIGNED_SHORT:
        arr = new Uint16Array(arr.buffer, arr.byteOffset, arr.byteLength);
        break;
      case WebGLRenderingContext.UNSIGNED_BYTE:
        arr = new Uint32Array(arr.buffer, arr.byteOffset, arr.byteLength);
        break;
      default:
        throw new Error("Unknown array buffer");
    }
    if(stride !== 0){
      throw new Error("Accessing a buffer with stride is not supported yet.");
    }
    return (i) => {
      return arr[offset + i];
    }
  }

  private _smallBufferToString(arr: Uint8Array): string {
    return String.fromCharCode.apply("", arr);
  }
}
