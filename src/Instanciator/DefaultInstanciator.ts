import InstanciationRecipe from "../Parser/InstanciationRecipe";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import GLTFNode from "../Parser/Schema/GLTFNode";
import Transform from "grimoirejs-fundamental/ref/Components/TransformComponent";

import Quaternion from "grimoirejs-math/ref/Quaternion";
import Vector3 from "grimoirejs-math/ref/Vector3";
import Matrix from "grimoirejs-math/ref/Matrix";

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
            const meshInfo = recipe.tf.meshes[node.mesh];
            if (primitives.length === 1) { // If the node contains single mesh
              const mat = recipe.materials[meshInfo.primitives[0].material];
              const meshNode = parent.addChildByName("mesh", {
                  geometry: primitives[0],
                  material:mat
              });
              currentNode = meshNode;
            } else { // If the node contains multiple mesh
                const objectNode = parent.addChildByName("object",{});
                for(let i = 0; i < primitives.length; i++){
                  const mat = recipe.materials[meshInfo.primitives[i].material];
                  const meshNode = objectNode.addChildByName("mesh", {
                      geometry: primitives[i],
                      material:mat
                  });
                }
                currentNode = objectNode;
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
      const transform = node.getComponent(Transform);
      if(nodeInfo.rotation){
        transform.setAttribute("rotation",new Quaternion([].concat(nodeInfo.rotation)));
      }
      if(nodeInfo.translation){
        transform.setAttribute("position",new Vector3([].concat(nodeInfo.translation)));
      }
      if(nodeInfo.scale){
        transform.setAttribute("scale",new Vector3([].concat(nodeInfo.scale)));
      }
      if(nodeInfo.matrix){
        if(nodeInfo.rotation || nodeInfo.translation || nodeInfo.scale){
          throw new Error("Matrix property can not be existed with other transoform property");
        }
        let mat = new Matrix(nodeInfo.matrix);
        transform.applyMatrix(mat);
      }
    }
}
