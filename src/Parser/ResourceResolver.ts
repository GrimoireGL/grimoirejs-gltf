import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import ImageResolver from "grimoirejs-fundamental/ref/Asset/ImageResolver";
export default class ResourceResolver {
    public baseUrl: string;

    constructor(public modelUrl: string) {
        this.baseUrl = this.urlToBaseUrl(modelUrl);
    }

    public fetchImage(uri: string): Promise<HTMLImageElement | HTMLCanvasElement> {
        if (this.isDataUri(uri)) {
            return this.imageFromDataUrl(uri);
        } else {
            return ImageResolver.resolve(this.baseUrl + uri);
        }
    }

    public fetchBinary(uri: string): Promise<ArrayBuffer> {
        if (this.isDataUri(uri)) {
            return new Promise((resolve, reject) => {
                resolve(this.dataUriToArrayBuffer(uri));
            });
        }
        return new Promise<ArrayBuffer>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", this.baseUrl + uri);
            xhr.responseType = "arraybuffer";
            xhr.onload = (v) => {
                resolve(xhr.response);
            };
            xhr.onerror = (e) => {
                reject(e);
            };
            xhr.send();
        });
    }

    public fetchText(uri: string): Promise<string> {
        if (this.isDataUri(uri)) {
            throw new Error("Not implemented");
        } else {
            return TextFileResolver.resolve(this.baseUrl + uri);
        }
    }

    private isDataUri(dataUri: string): boolean {
        return !!dataUri.match(/^\s*data\:.*;base64/);
    }
	/**
	 * Convert datauri string to ArrayBuffer
	 * @param  {string}      dataUri [description]
	 * @return {ArrayBuffer}         [description]
	 */
    private dataUriToArrayBuffer(dataUri: string): ArrayBuffer {
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

    private imageFromDataUrl(dataUrl: string): Promise<HTMLCanvasElement | HTMLImageElement> {
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

    private urlToBaseUrl(url: string): string {
        return url.substr(0, url.lastIndexOf("/") + 1);
    }
}