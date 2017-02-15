import IState from "grimoirejs-fundamental/ref/Material/IState";
import IVariableInfo from "grimoirejs-fundamental/ref/Material/IVariableInfo";
import GLTFTechnique from "./Schema/GLTFTechnique";
import TextFileResolver from "grimoirejs-fundamental/ref/Asset/TextFileResolver";
import TechniqueRecipe from "grimoirejs-fundamental/ref/Material/ITechniqueRecipe";
import Material from "../../node_modules/grimoirejs-fundamental/ref/Material/Material";
import MaterialFactory from "grimoirejs-fundamental/ref/Material/MaterialFactory";
import GLTFMaterial from "./Schema/GLTFMaterial";
import Texture2D from "grimoirejs-fundamental/ref/Resource/Texture2D";
import GLTFConstantConvert from "./ConstantConverter";
import ResourceResolver from "../Util/ResourceResolver";
import GLTF from "./Schema/GLTF";
export default class MaterialParser {
    public static async parse(tf: GLTF, matKey: string, rr: ResourceResolver, textures: { [key: string]: Texture2D }): Promise<{ [key: string]: any }> {
        const material = tf.materials[matKey];
        if (material.extensions && material.extensions.KHR_materials_common) {
            return this._parseMaterialCommon(tf, matKey, textures);
        } else {
            if (MaterialFactory.registerdHandlers[material.technique] === void 0) {
                const techniqueRecipe = await this._convertIntoTechniqueRecipe(tf, matKey, rr);
                MaterialFactory.addMaterialType(material.technique, (factory) => {
                    return new Material(factory.gl, techniqueRecipe);
                });
            }
            const result = {
                type: material.technique,
                class: "gltf-" + tf.id + "-" + matKey
            };
            for (let key in material.values) {
                const v = material.values[key];
                const teq = tf.techniques[material.technique];
                const tv = teq.parameters[key];
                let valName = "";
                for (let uKey in teq.uniforms) {　// to find variable name from info
                    if (teq.uniforms[uKey] === key) {
                        valName = uKey;
                    }
                }
                if (tv.type !== WebGLRenderingContext.SAMPLER_2D) {
                    result[valName] = material.values[key];
                } else {
                    result[valName] = textures[material.values[key]];
                }
            }
            return result;
        }
    }

    private static async _convertIntoTechniqueRecipe(tf: GLTF, matKey: string, resourceResolver: ResourceResolver): Promise<{ [key: string]: TechniqueRecipe }> {
        const mat = tf.materials[matKey];
        const technique = tf.techniques[mat.technique];
        const program = tf.programs[technique.program];
        let techniqueRecipe: TechniqueRecipe = {
            passes: [
                {
                    vertex: await resourceResolver.loadShader(tf.shaders[program.vertexShader]),
                    fragment: await resourceResolver.loadShader(tf.shaders[program.fragmentShader]),
                    attributes: this._asAttributeInfo(technique),
                    uniforms: this._asUniformInfo(technique),
                    macros: {},
                    states: this._getState(technique)
                }
            ],
            drawOrder: "UseAlpha"
        } as TechniqueRecipe;
        return {
            default: techniqueRecipe
        };
    }

    private static _asAttributeInfo(technique: GLTFTechnique): { [key: string]: IVariableInfo } {
        const result = {} as { [key: string]: IVariableInfo };
        for (let key in technique.attributes) {
            const attrGlue = technique.attributes[key];
            const paramInfo = technique.parameters[attrGlue];
            result[key] = {
                name: key,
                semantic: paramInfo.semantic,
                type: paramInfo.type
            } as IVariableInfo;
        }
        return result;
    }

    private static _asUniformInfo(technique: GLTFTechnique): { [key: string]: IVariableInfo } {
        const result = {} as { [key: string]: IVariableInfo };
        for (let key in technique.uniforms) {
            const uniGlue = technique.uniforms[key];
            const paramInfo = technique.parameters[uniGlue];
            const annotations = {};
            if (paramInfo.value) {
                annotations["default"] = paramInfo.value;
            }
            result[key] = {
                name: key,
                semantic: paramInfo.semantic || "USER_VALUE",
                type: paramInfo.type,
                attributes: annotations
            } as IVariableInfo;
        }
        return result;
    }

    private static _getState(technique: GLTFTechnique): IState {
        const result: IState = {
            enable: [],
            functions: {
                blendColor: [0, 0, 0, 0],
                cullFace: [WebGLRenderingContext.BACK],
                blendFuncSeparate: [WebGLRenderingContext.ONE, WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE, WebGLRenderingContext.ZERO],
                blendEquationSeparate: [WebGLRenderingContext.FUNC_ADD, WebGLRenderingContext.FUNC_ADD],
                lineWidth: [1],
                frontFace: [WebGLRenderingContext.CCW],
                depthRange: [0, 1],
                depthFunc: [WebGLRenderingContext.LESS]
            }
        };
        const st = technique.states;
        if (st.enable) {
            for (let item of st.enable) {
                result.enable.push(item);
            }
        }
        return result;
    }

    private static _parseMaterialCommon(tf: GLTF, matKey: string, textures: { [key: string]: Texture2D }): { [key: string]: any } {
        const material = tf.materials[matKey];
        const cmatData = material.extensions.KHR_materials_common;
        const matValues = cmatData.values;
        switch (cmatData.technique) {
            case "PHONG":
            case "BLINN":
                const result = {
                    type: "gltf-unlit",
                    class: "gltf-" + tf.id + "-" + matKey
                };
                this._setAsColorOrTexture(result, textures, matValues.ambient, "ambient", "ambientTexture");
                this._setAsColorOrTexture(result, textures, matValues.diffuse, "diffuse", "diffuseTexture");
                this._setAsColorOrTexture(result, textures, matValues.specular, "specular", "specularTexture"); this._setAsColorOrTexture(result, textures, matValues.specular, "specular", "specularTexture");
                this._setAsColorOrTexture(result, textures, matValues.emission, "emission", "emissionTexture");
                result["transparency"] = matValues["transparency"];
                result["shininess"] = matValues["shininess"];
                return result;
            default:
                throw new Error(`Unsupported common material technique ${cmatData.technique}`);
        }
    }

    private static _setAsColorOrTexture(result: any, textures: { [key: string]: Texture2D }, value: string | number[], nameOnColor: string, nameOnTexture: string): void {
        if (Array.isArray(value)) {
            result[nameOnColor] = GLTFConstantConvert.asColorValue(value);
        } else if (typeof value === "string") {
            result[nameOnTexture] = textures[value];
        } else if (value === void 0) {
            return;
        } else {
            throw new Error("Unknown type for color registration");
        }
    }
}
