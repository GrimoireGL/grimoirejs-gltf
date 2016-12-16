  import AccessorAccessor from "./Accessor/Accessor";
  import AnimationAnimation from "./Animation/Animation";
  import AnimationInterpolators from "./Animation/Interpolators";
  import ComponentsGLTFAnimationComponent from "./Components/GLTFAnimationComponent";
  import ComponentsGLTFJointComponent from "./Components/GLTFJointComponent";
  import ComponentsGLTFModelComponent from "./Components/GLTFModelComponent";
  import ParserConstantConverter from "./Parser/ConstantConverter";
  import ParserMaterialsCommonParser from "./Parser/MaterialsCommonParser";
  import ParserParser from "./Parser/Parser";
  import ParserResourceResolver from "./Parser/ResourceResolver";
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
  import __INTERFACE__16 from "./Parser/Schema/GLTFTexture";

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
    "MaterialsCommonParser": ParserMaterialsCommonParser,
    "Parser": ParserParser,
    "ResourceResolver": ParserResourceResolver
  }
};

let __BASE__ = __MAIN__();

Object.assign(__BASE__|| {},__EXPOSE__);

window["GrimoireJS"].lib.gltf = __EXPOSE__;

export default __BASE__;
