  import AccessorAccessor from "./Accessor/Accessor";
  import AnimatorAnimator from "./Animator/Animator";
  import AnimatorInterpolators from "./Animator/Interpolators";
  import ComponentsGLTFAnimatorComponent from "./Components/GLTFAnimatorComponent";
  import ComponentsGLTFModelComponent from "./Components/GLTFModelComponent";
  import ParserConstantConverter from "./Parser/ConstantConverter";
  import ParserMaterialsCommonParser from "./Parser/MaterialsCommonParser";
  import ParserParser from "./Parser/Parser";
  import __INTERFACE__1 from "./Animator/Interpolator";
  import __INTERFACE__2 from "./Parser/ParsedGLTF";
  import __INTERFACE__3 from "./Parser/Schema/GLTF";

import __MAIN__ from "./main"

var __EXPOSE__ = {
  "Accessor": {
    "Accessor": AccessorAccessor
  },
  "Animator": {
    "Animator": AnimatorAnimator,
    "Interpolators": AnimatorInterpolators
  },
  "Components": {
    "GLTFAnimatorComponent": ComponentsGLTFAnimatorComponent,
    "GLTFModelComponent": ComponentsGLTFModelComponent
  },
  "Parser": {
    "ConstantConverter": ParserConstantConverter,
    "MaterialsCommonParser": ParserMaterialsCommonParser,
    "Parser": ParserParser
  }
};

let __BASE__ = __MAIN__();

Object.assign(__BASE__|| {},__EXPOSE__);

window["GrimoireJS"].lib.gltf = __EXPOSE__;

export default __BASE__;
