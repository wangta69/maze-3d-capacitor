import { Component, OnInit, HostListener, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
// import OrbitControls from 'orbit-controls-es6';
// https://github.com/wwwtyro/Astray : 미로 찾기 게임같은것인데 재미는 없지만 알고리즘 분석은 필요 (이거 분석하여 장애물 통과하기 개발하면 좋을 듯 함)
// http://wwwtyro.github.io/Astray/ + box2d
import * as CANNON from 'cannon';



/* global CANNON,THREE,Detector */

/**
 * Adds Three.js primitives into the scene where all the Cannon bodies and shapes are.
 * @class CannonDebugRenderer
 * @param THREE.Scene scene
 * @param CANNON.World world
 * @param object [options]
 */
export class CannonDebugRenderer {
        private options: any;

        private scene: THREE.Scene;
        private world: CANNON.World;

        private meshes: any[];

        private material: THREE.MeshBasicMaterial;
        private sphereGeometry: THREE.SphereGeometry;
        private boxGeometry: THREE.BoxGeometry;
        private planeGeometry: THREE.PlaneGeometry;
        private cylinderGeometry: THREE.CylinderGeometry;
    constructor(scene: THREE.Scene, world: CANNON.World, options?: any) {
        this.options = options || {};

        this.scene = scene;
        this.world = world;

        this.meshes = [];

        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        this.sphereGeometry = new THREE.SphereGeometry(1);
        this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.planeGeometry = new THREE.PlaneGeometry( 10, 10, 10, 10 );
        this.cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 10, 10 );
    }

    public update() {
    //    console.log('CannonDebugRenderer update');
        const bodies = this.world.bodies;
        const meshes = this.meshes;
        const shapeWorldPosition = new CANNON.Vec3();
        const shapeWorldQuaternion = new CANNON.Quaternion();

        let meshIndex = 0;
        // console.log(this.world.bodies);
        for (let i = 0; i !== bodies.length; i++) {
            const body = bodies[i];

            for (let j = 0; j !== body.shapes.length; j++) {
                const shape = body.shapes[j];

                this._updateMesh(meshIndex, body, shape);

                const mesh = meshes[meshIndex];

                if (mesh) {

                    // Get world position
                    body.quaternion.vmult(body.shapeOffsets[j], shapeWorldPosition);
                    body.position.vadd(shapeWorldPosition, shapeWorldPosition);

                    // Get world quaternion
                    body.quaternion.mult(body.shapeOrientations[j], shapeWorldQuaternion);

                    // Copy to meshes
                    mesh.position.copy(shapeWorldPosition);
                    mesh.quaternion.copy(shapeWorldQuaternion);
                }

                meshIndex++;
            }
        }

        for (const mesh of meshes) {
            if (mesh) { // 이 부분의 역확인 뭔지.. 이 부분이 있으면 실제 안보임
                // this.scene.remove(mesh);
            }
        }

        meshes.length = meshIndex;
    }

    private _updateMesh(index: any, body: any, shape: any) {
        let mesh = this.meshes[index];
        if (!this._typeMatch(mesh, shape)) {
            if (mesh) {
                this.scene.remove(mesh);
            }
            mesh = this.meshes[index] = this._createMesh(shape);
        }
        this._scaleMesh(mesh, shape);
    }

    private _typeMatch(mesh: any, shape: any) {
        if (!mesh) {
            return false;
        }
        const geo = mesh.geometry;
        return (
            (geo instanceof THREE.SphereGeometry && shape instanceof CANNON.Sphere) ||
            (geo instanceof THREE.BoxGeometry && shape instanceof CANNON.Box) ||
            (geo instanceof THREE.PlaneGeometry && shape instanceof CANNON.Plane) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.ConvexPolyhedron) ||
        //    (geo.id === shape.geometryId && shape instanceof CANNON.Trimesh) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Heightfield)
        );
    }

    private _createMesh(shape: any) {
        let mesh;
        // let geometry: THREE.Geometry;
         let geometry: any;

        const material = this.material;

        switch (shape.type) {

            case CANNON.Shape.types.SPHERE:
                mesh = new THREE.Mesh(this.sphereGeometry, material);
                break;

            case CANNON.Shape.types.BOX:
                mesh = new THREE.Mesh(this.boxGeometry, material);
                break;

            case CANNON.Shape.types.PLANE:
                mesh = new THREE.Mesh(this.planeGeometry, material);
                break;

            case CANNON.Shape.types.CONVEXPOLYHEDRON:
                // Create mesh
                // const geo = new THREE.Geometry();
                const geo = new THREE.BufferGeometry()

                // Add vertices
                for (const v of shape.vertices) {
                    // geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
                    geo.setAttribute( 'position', new THREE.BufferAttribute( [v.x, v.y, v.z], 3 ) );
                }

                for ( const face of shape.faces) {
                    // add triangles
                    const a = face[0];
                    for (let j = 1; j < face.length - 1; j++) {
                        const b = face[j];
                        const c = face[j + 1];
                        // geo.faces.push(new THREE.Face3(a, b, c));

                    }
                }
                geo.computeBoundingSphere();
                // geo.computeFaceNormals();

                mesh = new THREE.Mesh(geo, material);
                shape.geometryId = geo.id;
                break;
/*
            case CANNON.Shape.types.TRIMESH:
                geometry = new THREE.Geometry();
                v0 = this.tmpVec0;
                v1 = this.tmpVec1;
                v2 = this.tmpVec2;
                for (let i = 0; i < shape.indices.length / 3; i++) {
                    shape.getTriangleVertices(i, v0, v1, v2);
                    geometry.vertices.push(
                        new THREE.Vector3(v0.x, v0.y, v0.z),
                        new THREE.Vector3(v1.x, v1.y, v1.z),
                        new THREE.Vector3(v2.x, v2.y, v2.z)
                    );
                    const j = geometry.vertices.length - 3;
                    geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
                }
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                mesh = new THREE.Mesh(geometry, material);
                shape.geometryId = geometry.id;
                break;
                */

            case CANNON.Shape.types.HEIGHTFIELD:
                // geometry = new THREE.Geometry();
                geometry = new THREE.BufferGeometry()

                const v0 = new CANNON.Vec3();
                const v1 = new CANNON.Vec3();
                const v2 = new CANNON.Vec3();

                for (let xi = 0; xi < shape.data.length - 1; xi++) {
                    for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
                        for (let k = 0; k < 2; k++) {
                            shape.getConvexTrianglePillar(xi, yi, k === 0);
                            v0.copy(shape.pillarConvex.vertices[0]);
                            v1.copy(shape.pillarConvex.vertices[1]);
                            v2.copy(shape.pillarConvex.vertices[2]);
                            v0.vadd(shape.pillarOffset, v0);
                            v1.vadd(shape.pillarOffset, v1);
                            v2.vadd(shape.pillarOffset, v2);
                            geometry.vertices.push(
                                new THREE.Vector3(v0.x, v0.y, v0.z),
                                new THREE.Vector3(v1.x, v1.y, v1.z),
                                new THREE.Vector3(v2.x, v2.y, v2.z)
                            );
                            const i = geometry.vertices.length - 3;
                            // geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
                        }
                    }
                }
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                mesh = new THREE.Mesh(geometry, material);
                shape.geometryId = geometry.id;
                break;
        }

        if (mesh) {
            this.scene.add(mesh);
        }

        return mesh;
    }

    private  _scaleMesh(mesh: any, shape: any) {
        switch (shape.type) {

        case CANNON.Shape.types.SPHERE:
            const radius = shape.radius;
            mesh.scale.set(radius, radius, radius);
            break;

        case CANNON.Shape.types.BOX:
            mesh.scale.copy(shape.halfExtents);
            mesh.scale.multiplyScalar(2);
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            mesh.scale.set(1, 1, 1);
            break;
/*
        case CANNON.Shape.types.TRIMESH:
            mesh.scale.copy(shape.scale);
            break;
*/
        case CANNON.Shape.types.HEIGHTFIELD:
            mesh.scale.set(1, 1, 1);
            break;

        }
    }
//    console.log('CannonDebugRenderer', scene, world, options);

}
/*;

CannonDebugRenderer.prototype = {

    tmpVec0: new CANNON.Vec3(),
    tmpVec1: new CANNON.Vec3(),
    tmpVec2: new CANNON.Vec3(),
    tmpQuat0: new CANNON.Vec3(),


};
*/
