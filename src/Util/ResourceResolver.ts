import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
/**
 * Provides resolving resource dependency while parsing gltf file.
 */
export default class ResourceResolver{
  public baseDirectory:string;

  constructor(private _rootPath:string){
    this.baseDirectory = this._getBaseDir(_rootPath);
  }


  /**
   * Load image from specified url or dataURL.
   * @param  {string}  url [description]
   * @return {Promise}     [description]
   */
  public loadImage(url:string):Promise<HTMLImageElement|HTMLCanvasElement>{
    if (this._isDataUrl(url)) {
      return this._dataUriToImage(url)
    } else {
      return ImageResolver.resolve(this.baseDirectory + url);
    }
  }

  /**
   * Load buffer from specified url or dataURL.
   * @return {Promise<ArrayBuffer>} [description]
   */
  public loadBuffer(url:string):Promise<ArrayBuffer>{
    if (this._isDataUrl(url)) {
      return new Promise((resolve, reject) => {
        resolve(this._dataUriToArrayBuffer(url));
      });
    }
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", this.baseDirectory + url);
      xhr.responseType = "arraybuffer";
      xhr.onload = (v) => {
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        reject({
          message: `Loading resource at '${this.baseDirectory + url} failed. Is there resource file in dependency at correct location?'`,
          error:e
        });
      };
      xhr.send();
    });
  }

  /**
   * Load string from specified url or dataURL
   * @param  {string}          url [description]
   * @return {Promise<string>}     [description]
   */
  public loadString(url:string):Promise<string>{
    if(this._isDataUrl(url)){
      throw new Error("Not implemented yet");
    }else{
      return TextFileResolver.resolve(this.baseDirectory + url);
    }
  }

  /**
   * Convert data url string into array buffer
   * @param  {string}      dataUri [description]
   * @return {ArrayBuffer}         [description]
   */
  private _dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
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
  private _dataUriToImage(dataUrl: string): Promise<HTMLCanvasElement | HTMLImageElement> {
    return new Promise((resolve, reject) => {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var image = new Image();
      image.src = dataUrl;
      image.onload = function() {
        const cWidth = Math.pow(2, Math.ceil(Math.log(image.width) / Math.LN2));
        const cHeight = Math.pow(2, Math.ceil(Math.log(image.height) / Math.LN2));
        if (cWidth === image.width && cHeight == image.height) {
          resolve(image);
        }
        canvas.width = cWidth;
        canvas.height = cHeight;
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, cWidth, cHeight);
        resolve(canvas);
      };
    });
  }

  /**
   * Check specified url is dataUrl or not
   * @param  {string}  dataUrl [description]
   * @return {boolean}         [description]
   */
  private _isDataUrl(dataUrl: string): boolean {
    return !!dataUrl.match(/^\s*data\:.*;base64/);
  }

  /**
   * Get directiory location from specified url
   * @param  {string} url [description]
   * @return {string}     [description]
   */
  private _getBaseDir(url: string): string {
    return url.substr(0, url.lastIndexOf("/") + 1);
  }
}
