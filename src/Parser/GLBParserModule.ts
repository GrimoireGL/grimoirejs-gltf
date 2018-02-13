
import ParserModule from "./ParserModule";
import { Undef } from "grimoirejs/ref/Tool/Types";
import GLTF from "./Schema/GLTF";
export interface GLBChunk {
    chunkLength: number;
    chunkType: number;
    data: Uint8Array;
}
export default class GLBParserModule extends ParserModule {
    public glbVersion: number;
    public entireLength: number;
    public jsonChunk: GLBChunk;
    public bufferChunk: GLBChunk;
    public isGLB: boolean = false;
    public loadAsGLTF(buffer: ArrayBuffer): Undef<GLTF> {
        const dr = new DataView(buffer);
        if (dr.getUint32(0, true) === 0x46546C67) {
            this.isGLB = true;
            this.glbVersion = dr.getUint32(1, true)
            this.entireLength = dr.getUint32(2, true)
            let currentOffset = 12;
            let jsonChunkLoaded = false;
            let bufferChunkLoaded = true;
            while ((!jsonChunkLoaded || !bufferChunkLoaded) && dr.byteLength !== currentOffset) {
                const chunk = this._readChunk(currentOffset, buffer);
                currentOffset += chunk.chunkLength + 8;
                switch (chunk.chunkType) {
                    case 0x4E4F534A:
                        this.jsonChunk = chunk;
                        continue;
                    case 0x004E4942:
                        this.bufferChunk = chunk;
                        continue;
                }
            }
            return JSON.parse(this.__convertUint8ArrayToUTF8String(this.jsonChunk.data)) as GLTF;
        }
        return undefined;
    }

    public loadBufferResources(tf: GLTF): Promise<{ [key: string]: ArrayBuffer }> {
        if (!this.isGLB) {
            return undefined;
        }
        if (tf.buffers && ((Object.keys(tf.buffers).length === 1 && !tf.buffers[0]) || Object.keys(tf.buffers).length > 1)) {
            throw new Error(`GLB with external buffers are not supported yet`);
        }
        return Promise.resolve({
            0: this.bufferChunk.data.buffer.slice(this.bufferChunk.data.byteOffset) as ArrayBuffer
        });
    }

    private _readChunk(offset: number, src: ArrayBuffer): GLBChunk {
        const arr = new DataView(src, offset, 8);
        const len = arr.getUint32(0, true);
        return {
            chunkLength: len,
            chunkType: arr.getUint32(4, true),
            data: new Uint8Array(src, offset + 8, len)
        }
    }
}