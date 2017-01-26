import GLTFShader from "../Parser/Schema/GLTFShader";
import GLTFImage from "../Parser/Schema/GLTFImage";
import GLTF from "../Parser/Schema/GLTF";
import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
import HashCalculator from "grimoirejs-fundamental/ref/Util/HashCalculator";
/**
 * Provides resolving resource dependency while parsing gltf file.
 */
export default class ResourceResolver {
    public baseDirectory: string;

    public binaryGLTFBuffer: ArrayBuffer;

    public tf: GLTF;

    constructor(private _rootPath: string) {
        this.baseDirectory = this._getBaseDir(_rootPath);
    }

    public loadGLTFFile(): Promise<GLTF> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", this._rootPath);
            xhr.responseType = "arraybuffer";
            xhr.onload = (v) => {
                const uiarr = new Uint8Array(xhr.response);
                const glTFMagic = [103, 108, 84, 70];
                let isBinary = true;
                for (let i = 0; i < glTFMagic.length; i++) {
                    if (uiarr[i] !== glTFMagic[i]) {
                        isBinary = false;
                    }
                }
                let resultJson;
                if (isBinary) {
                    const darr = new DataView(xhr.response);
                    const fl = darr.getUint32(8, true); // fullLength
                    const l = darr.getUint32(12, true); // contentLength
                    resultJson = this._bufferToString(xhr.response.slice(20, 20 + l));
                    this.binaryGLTFBuffer = xhr.response.slice(20 + l, fl);
                } else {
                    resultJson = this._bufferToString(xhr.response);
                }
                this.tf = JSON.parse(resultJson) as GLTF;
                this.tf.id = HashCalculator.calcHash(resultJson);
                resolve(this.tf);
            };
            xhr.onerror = (e) => {
                // reject({
                //   message: `Loading resource at '${this.baseDirectory + url} failed. Is there resource file in dependency at correct location?'`,
                //   error:e
                // });
            };
            xhr.send();
        });
    }


    /**
     * Load image from specified url or dataURL.
     * @param  {string}  url [description]
     * @return {Promise}     [description]
     */
    public loadImage(image: GLTFImage): Promise<HTMLImageElement | HTMLCanvasElement> {
        let url = image.uri;
        let isBlob = false;
        if (image["extensions"] && image["extensions"]["KHR_binary_glTF"]) {
            const binaryInfo = image["extensions"]["KHR_binary_glTF"];
            const bufferViewInfo = this.tf.bufferViews[binaryInfo.bufferView];
            const blob = new Blob([new Uint8Array(this.binaryGLTFBuffer, bufferViewInfo.byteOffset, bufferViewInfo.byteLength)], {
                type: binaryInfo.mimeType
            });
            url = window.URL.createObjectURL(blob);
            isBlob = true;
        }
        if (this._isDataUrl(url)) {
            return this._dataUriToImage(url)
        } else {
            return ImageResolver.resolve(isBlob ? url : this.baseDirectory + url);
        }
    }

    /**
     * Load buffer from specified url or dataURL.
     * @return {Promise<ArrayBuffer>} [description]
     */
    public loadBuffer(url: string): Promise<ArrayBuffer> {
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
                    error: e
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
    public loadShader(shader: GLTFShader): Promise<string> {
        let url = shader.uri;
        let isBlob = false;
        if (shader["extensions"] && shader["extensions"]["KHR_binary_glTF"]) {
            const binaryInfo = shader["extensions"]["KHR_binary_glTF"];
            const bufferViewInfo = this.tf.bufferViews[binaryInfo.bufferView];
            const blob = new Blob([new Uint8Array(this.binaryGLTFBuffer, bufferViewInfo.byteOffset, bufferViewInfo.byteLength)], {
                type: "text/plain"
            });
            url = window.URL.createObjectURL(blob);
            isBlob = true;
        }
        if (this._isDataUrl(url)) {
            return Promise.resolve(this._dataUriToText(url));
        } else {
            return TextFileResolver.resolve(isBlob ? url : this.baseDirectory + url);
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
            image.onload = () => {
                resolve(this._ensureCorrectSize(image));
            };
        });
    }

    private _dataUriToText(dataUrl: string): string {
        const splittedUri = dataUrl.split(",");
        const byteString = atob(splittedUri[1]);
        return byteString;
    }

    private _ensureCorrectSize(image: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        const cWidth = Math.pow(2, Math.ceil(Math.log(image.width) / Math.LN2));
        const cHeight = Math.pow(2, Math.ceil(Math.log(image.height) / Math.LN2));
        if (cWidth === image.width && cHeight == image.height) {
            return image;
        }
        canvas.width = cWidth;
        canvas.height = cHeight;
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, cWidth, cHeight);
        return canvas;
    }

    private _bufferToString(arr: ArrayBuffer): string {
        let tmp = "";
        let len = 1024;
        for (var p = 0; p < arr.byteLength; p += len) {
            tmp += this._smallBufferToString(new Uint8Array(arr.slice(p, p + len)));
        }
        return tmp;
    }

    private _smallBufferToString(arr: Uint8Array): string {
        return String.fromCharCode.apply("", arr);
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
