  import AccessorAccessor from "./Accessor/Accessor";
  import AnimationAnimation from "./Animation/Animation";
  import AnimationInterpolators from "./Animation/Interpolators";
  import ComponentsGLTFAnimationComponent from "./Components/GLTFAnimationComponent";
  import ComponentsGLTFJointComponent from "./Components/GLTFJointComponent";
  import ComponentsGLTFModelComponent from "./Components/GLTFModelComponent";
  import ParserConstantConverter from "./Parser/ConstantConverter";
  import ParserGLTFMaterialFactory from "./Parser/GLTFMaterialFactory";
  import ParserMaterialParser from "./Parser/MaterialParser";
  import ParserParser from "./Parser/Parser";
  import UtilResourceResolver from "./Util/ResourceResolver";
  import __INTERFACE__1 from "./Animation/Interpolator";
  import __INTERFACE__2 from "./Parser/ParsedGLTF";
  import __INTERFACE__3 from "./Parser/Schema/GLTF";
  import __INTERFACE__4 from "./Parser/Schema/GLTFAccessor";
  import __INTERFACE__5 from "./Parser/Schema/GLTFAnimation";
  import __INTERFACE__6 from "./Parser/Schema/GLTFAnimationChannel";
  import __INTERFACE__7 from "./Parser/Schema/GLTFAnimationSampler";
  import __INTERFACE__8 from "./Parser/Schema/GLTFBuffer";
  import __INTERFACE__9 from "./Parser/Schema/GLTFBufferView";
  import __INTERFACE__10 from "./Parser/Schema/GLTFImage";
  import __INTERFACE__11 from "./Parser/Schema/GLTFMaterial";
  import __INTERFACE__12 from "./Parser/Schema/GLTFMesh";
  import __INTERFACE__13 from "./Parser/Schema/GLTFNode";
  import __INTERFACE__14 from "./Parser/Schema/GLTFSampler";
  import __INTERFACE__15 from "./Parser/Schema/GLTFSkin";
  import __INTERFACE__16 from "./Parser/Schema/GLTFTechnique";
  import __INTERFACE__17 from "./Parser/Schema/GLTFTexture";

var __VERSION__ = "1.7.1";
var __NAME__ = "grimoirejs-gltf";

import __MAIN__ from "./main"

var __EXPOSE__ = {
  "Accessor": {
    "Accessor": AccessorAccessor
  },
  "Animation": {
    "Animation": AnimationAnimation,
    "Interpolators": AnimationInterpolators
  },
  "Components": {
    "GLTFAnimationComponent": ComponentsGLTFAnimationComponent,
    "GLTFJointComponent": ComponentsGLTFJointComponent,
    "GLTFModelComponent": ComponentsGLTFModelComponent
  },
  "Parser": {
    "ConstantConverter": ParserConstantConverter,
    "GLTFMaterialFactory": ParserGLTFMaterialFactory,
    "MaterialParser": ParserMaterialParser,
    "Parser": ParserParser
  },
  "Util": {
    "ResourceResolver": UtilResourceResolver
  }
};

let __BASE__ = __MAIN__();

Object.assign(__EXPOSE__,{
    __VERSION__:__VERSION__,
    __NAME__:__NAME__
});
Object.assign(__BASE__|| {},__EXPOSE__);

window["GrimoireJS"].lib.gltf = __EXPOSE__;

export default __BASE__;
