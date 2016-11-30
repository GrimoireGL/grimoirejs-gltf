  import ComponentsGLTFModelComponent from "./Components/GLTFModelComponent";
  import ParserGLTFConstantConvert from "./Parser/GLTFConstantConvert";
  import ParserGLTFMaterialsCommonParser from "./Parser/GLTFMaterialsCommonParser";
  import ParserGLTFParser from "./Parser/GLTFParser";
  import __INTERFACE__1 from "./Parser/ParsedGLTF";
  import __INTERFACE__2 from "./Parser/Schema/GLTF";

import __MAIN__ from "./main"

var __EXPOSE__ = {
  "Components": {
    "GLTFModelComponent": ComponentsGLTFModelComponent
  },
  "Parser": {
    "GLTFConstantConvert": ParserGLTFConstantConvert,
    "GLTFMaterialsCommonParser": ParserGLTFMaterialsCommonParser,
    "GLTFParser": ParserGLTFParser
  }
};

let __BASE__ = __MAIN__();

Object.assign(__BASE__|| {},__EXPOSE__);

window["GrimoireJS"].lib.gltf = __EXPOSE__;

export default __BASE__;
