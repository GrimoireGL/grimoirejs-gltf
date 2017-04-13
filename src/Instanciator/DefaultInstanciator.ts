import InstanciationRecipe from "../Parser/InstanciationRecipe";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import GLTFNode from "../Parser/Schema/GLTFNode";

import Quaternion from "grimoirejs-math/ref/Quaternion";
import Vector3 from "grimoirejs-math/ref/Vector3";

export default class DefaultInstanciator {
    public instanciateAll(recipe: InstanciationRecipe, node: GomlNode, scene: string | number): void {
        let sceneIndex = scene;
        if (sceneIndex === null) {
            sceneIndex = recipe.tf.scene;
        }
        if (typeof sceneIndex !== "number") {
            for (let key in recipe.tf.scenes) {
                sceneIndex = key;
                break;
            }
        }
        const sceneInfo = recipe.tf.scenes[sceneIndex];
        this.__instanciateScene(sceneInfo, node, recipe);
    }

    protected __instanciateScene(scene: { nodes: string[] }, node: GomlNode, recipe: InstanciationRecipe) {
        for (let nodeName of scene.nodes) {
            this.__instanciateNode(recipe, nodeName, node);
        }
    }

    protected __instanciateNode(recipe: InstanciationRecipe, nodeName: string, parent: GomlNode) {
        const node = recipe.tf.nodes[nodeName];
        let currentNode;
        if (node.mesh !== void 0) {
            const primitives = recipe.primitives[node.mesh];
            if (primitives.length === 1) {
              const meshInfo = recipe.tf.meshes[node.mesh];
              const mat = recipe.materials[meshInfo.primitives[0].material];
                const meshNode = parent.addChildByName("mesh", {
                    geometry: primitives[0],
                    material:mat
                });
                currentNode = meshNode;
            } else {
                console.error("multiple mesh is not supported yet")
            }
        } else {
            currentNode = parent.addChildByName("object", {});
        }
        this.__applyTransform(currentNode,node);
        if (node.children) {
            for (let child of node.children) {
                this.__instanciateNode(recipe, child, currentNode);
            }
        }
    }

    protected __applyTransform(node:GomlNode,nodeInfo:GLTFNode){
      if(nodeInfo.rotation){
        node.setAttribute("rotation",new Quaternion([].concat(nodeInfo.rotation)));
      }
      if(nodeInfo.translation){
        node.setAttribute("position",new Vector3([].concat(nodeInfo.translation)));
      }
      if(nodeInfo.scale){
        node.setAttribute("scale",new Vector3([].concat(nodeInfo.scale)));
      }
    }
}
