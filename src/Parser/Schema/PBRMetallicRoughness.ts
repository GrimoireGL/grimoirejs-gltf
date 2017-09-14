import GLTFTextureReference from "./GLTFTextureReference";
interface PBRMetallicRoughness{
    baseColorFactor:number[];
    baseColorTexture:GLTFTextureReference;
    metallicFactor:number;
    roughnessFactor:number;
    metallicRoughnessTexture:GLTFTextureReference;
    extensions:{}
    extras:any;
}

export default PBRMetallicRoughness;