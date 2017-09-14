import PBRMetallicRoughness from "./PBRMetallicRoughness"
import GLTFTextureReference from "./GLTFTextureReference";
interface GLTFMaterial {
  extensions: {
    [key: string]: any;
  };
  extras:any;
  pbrMetallicRoughness:PBRMetallicRoughness;
  normalTexture:GLTFTextureReference;
  occlusionTexture:GLTFTextureReference;
  emissiveTexture:GLTFTextureReference;
  emissiveFactor:number[];
  alphaMode:string;
  alphaCutoff:number;
  values: {
    [paramName: string]: any;
  };
  name: string;
  doubleSided:boolean;
}

export default GLTFMaterial;
