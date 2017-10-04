import InstanciationRecipe from "../Parser/InstanciationRecipe";
import GomlNode from "grimoirejs/ref/Node/GomlNode";
import GLTFNode from "../Parser/Schema/GLTFNode";
import Transform from "grimoirejs-fundamental/ref/Components/TransformComponent";
import MeshRenderer from "grimoirejs-fundamental/ref/Components/MeshRendererComponent";


import Quaternion from "grimoirejs-math/ref/Quaternion";
import Vector3 from "grimoirejs-math/ref/Vector3";
import Matrix from "grimoirejs-math/ref/Matrix";

import AnimationFactory from "grimoirejs-animation/ref/Animation/AnimationFactory";

import GLTFModelComponent from "../Components/GLTFModelComponent";

export default class DefaultInstanciator {
  public instanciateAll(recipe: InstanciationRecipe, model: GLTFModelComponent, scene: string | number): void {
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
    this.__instanciateScene(sceneInfo, model, recipe);
    this.__instanciateAnimations(model, recipe);
  }

  protected __instanciateScene(scene: { nodes: string[] }, model: GLTFModelComponent, recipe: InstanciationRecipe) {
    const nodes: { [key: string]: GomlNode } = {};
    for (let nodeName of scene.nodes) {
      this.__instanciateNode(recipe, nodeName, nodes, model.node, model);
    }
  }

  protected __instanciateAnimations(model: GLTFModelComponent, recipe: InstanciationRecipe): void {
    for (let key in recipe.animations) {
      AnimationFactory.addAnimation("gltf-animation-" + key, JSON.stringify(recipe.animations[key]));
      model.node.addComponent("Animation", {
        animation: "gltf-animation-" + key,
        clips: "default"
      });
    }
  }

  protected __instanciateNode(recipe: InstanciationRecipe, nodeName: string, instanciatedNodes: { [key: string]: GomlNode }, parent: GomlNode, model: GLTFModelComponent) {
    const node = recipe.tf.nodes[nodeName];
    let currentNode;
    const meshes: GomlNode[] = [];
    if (node.mesh !== void 0) {
      const primitives = recipe.primitives[node.mesh];
      const meshInfo = recipe.tf.meshes[node.mesh];
      if (primitives.length === 1) { // If the node contains single mesh
        const mat = recipe.materials[meshInfo.primitives[0].material];
        const primitiveInfo = recipe.tf.meshes[node.mesh].primitives[0];
        let cull = "back";
        if(recipe.tf.materials && meshInfo.primitives[0].material !== void 0 && recipe.tf.materials[meshInfo.primitives[0].material] !== void 0){
          cull = recipe.tf.materials[meshInfo.primitives[0].material].doubleSided ? "none": "back";
        }
        const meshNode = parent.addChildByName("mesh", {
          geometry: primitives[0],
          material: mat,
          cull:cull
        });
        if(primitiveInfo.targets !== void 0 && primitiveInfo.targets.length > 1){
          meshNode.addComponent("GLTFVertexMorpher",{
            weights:meshInfo.weights
          });
        }
        meshes.push(meshNode);
        currentNode = meshNode;
      } else { // If the node contains multiple mesh
        const objectNode = parent.addChildByName("object", {});
        for (let i = 0; i < primitives.length; i++) {
          const mat = recipe.materials[meshInfo.primitives[i].material];
          let cull = "back";
          if(recipe.tf.materials && meshInfo.primitives[i].material !== void i && recipe.tf.materials[meshInfo.primitives[i].material] !== void 0){
            cull = recipe.tf.materials[meshInfo.primitives[i].material].doubleSided ? "none": "back";
          }    
          const meshNode = objectNode.addChildByName("mesh", {
            geometry: primitives[i],
            material: mat,
            cull:cull       
          });
          meshes.push(meshNode);
        }
        currentNode = objectNode;
      }
    } else {
      currentNode = parent.addChildByName("object", {});
    }
    instanciatedNodes[nodeName] = currentNode;
    currentNode.setAttribute("class", "gltf-node-" + nodeName);
    this.__applyTransform(currentNode, node);
    if (node.children) {
      for (let child of node.children) {
        this.__instanciateNode(recipe, child, instanciatedNodes, currentNode, model);
      }
    }
    // If this node was skin, create joint matrix buffer in model
    if (node.skin !== void 0) {
      const skinInfo = recipe.tf.skins[node.skin];
      model.skeletons[node.skin] = currentNode.getComponent(Transform);
      const invBindShapeMatrixSourceAccessor = recipe.tf.accessors[skinInfo.inverseBindMatrices];
      const invBindShapeMatrixSourceBufferInfo = recipe.tf.bufferViews[invBindShapeMatrixSourceAccessor.bufferView];
      const invBindShapeMatrixSource = recipe.bufferViews[invBindShapeMatrixSourceAccessor.bufferView];
      const invBindShapeMatrixSourceCasted = new Float32Array(invBindShapeMatrixSource.buffer, invBindShapeMatrixSource.byteOffset, invBindShapeMatrixSource.byteLength / 4);
      const stride = !invBindShapeMatrixSourceBufferInfo.byteStride ? 4 : invBindShapeMatrixSourceBufferInfo.byteStride;
      const getInvBindShapeElement = (i) => invBindShapeMatrixSourceCasted[invBindShapeMatrixSourceAccessor.byteOffset / 4 + stride / 4 * i];
      if (model.jointMatrices[node.skin] === void 0) {
        model.jointMatrices[node.skin] = new Float32Array(skinInfo.joints.length * 16);
      }
      for (let i = 0; i < meshes.length; i++) {
        meshes[i].setAttribute("fundamental.MaterialContainer.jointCount", skinInfo.joints.length);
        meshes[i].getComponent(MeshRenderer).renderArgs["gltf-jointMatrices"] = model.jointMatrices[node.skin];
      }
      skinInfo.joints.forEach((j, jointIndex) => {
        if (instanciatedNodes[j]) {
          const invBindShapeMatrix = new Array(16);
          for (let i = 0; i < 16; i++) {
            invBindShapeMatrix[i] = getInvBindShapeElement(i + 16 * jointIndex);
          }
          instanciatedNodes[j].setAttribute("class", instanciatedNodes[j].getAttribute("class") + " gltf-joint-" + jointIndex);
          instanciatedNodes[j].addComponent("GLTFJoint", {
            invBindShapeMatrix: invBindShapeMatrix,
            skinIndex: node.skin,
            jointIndex: jointIndex
          });
        } else {
          throw new Error("specified node was not found");
        }
      });
    }
  }

  protected __applyTransform(node: GomlNode, nodeInfo: GLTFNode) {
    const transform = node.getComponent(Transform);
    if (nodeInfo.rotation) {
      transform.setAttribute("rotation", new Quaternion([].concat(nodeInfo.rotation)));
    }
    if (nodeInfo.translation) {
      transform.setAttribute("position", new Vector3([].concat(nodeInfo.translation)));
    }
    if (nodeInfo.scale) {
      transform.setAttribute("scale", new Vector3([].concat(nodeInfo.scale)));
    }
    if (nodeInfo.matrix) {
      if (nodeInfo.rotation || nodeInfo.translation || nodeInfo.scale) {
        throw new Error("Matrix property can not be existed with other transoform property");
      }
      let mat = new Matrix(nodeInfo.matrix);
      transform.applyMatrix(mat);
    }
  }
}
