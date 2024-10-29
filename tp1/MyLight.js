import * as THREE from 'three';

class MyLight {

    constructor(app, targetPosition, intensity, distance, angle, penumbra, decay, castShadow=false, hasAngle=true) {
        this.app = app;
        this.targetPosition = targetPosition;
        this.intensity = intensity;
        this.distance = distance;
        this.angle = angle;
        this.penumbra = penumbra;
        this.decay = decay;
        this.castShadow = castShadow;
        this.hasAngle = hasAngle;
        
        this.barrierX = 4;
        this.padding = 0.3;
        this.spotLightHeight = 9;

        this.material = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/support.jpg')
        });
    }

    display() {
        let posX;
        let posZ;

        if (this.hasAngle) {
            posX = this.targetPosition[0] < 0 ? -this.barrierX : this.barrierX;
            posZ = this.targetPosition[0] < 0 ? -this.targetPosition[0] : this.targetPosition[0];
        }
        else {
            posX = this.targetPosition[0];
            posZ = this.targetPosition[2];
        }

        const support = this.#buildSupport(posX, posZ);
        const light = this.#buildLight(posX, posZ);
        const spotLight = this.#buildSpotLight(posX, posZ);

        const group = new THREE.Group();
        
        group.add(support);
        group.add(light);
        group.add(spotLight);

        return group;
    }

    #buildSpotLight(posX, posZ) {
        const positionX = posX < 0 ? posX - this.padding : posX + this.padding;
        const targetPosX = posX < 0 ? this.targetPosition[2] : -this.targetPosition[2];
        const spotLight = new THREE.SpotLight(0xFFFFFF, this.intensity, this.distance, this.angle, this.penumbra, this.decay);
        spotLight.castShadow = this.castShadow;

        if (this.hasAngle) {
            spotLight.position.set(positionX, this.spotLightHeight - this.padding, posZ);
            spotLight.target.position.set(targetPosX, this.targetPosition[1] + 0.5, Math.abs(this.targetPosition[0]));
        }
        else {
            spotLight.position.set(this.targetPosition[0], this.spotLightHeight - this.padding, posZ);
            spotLight.target.position.set(...this.targetPosition);
        }

        spotLight.target.updateMatrixWorld();

        return spotLight;
    }

    #buildLight(posX, posZ) {
        const line = new THREE.LineCurve3(
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 1, 0)
        );

        const mesh = this.#buildTube(line);
        const rotZ = posX < 0 ? -Math.PI / 4 : Math.PI / 4;
        const positionX = posX < 0 ? posX + this.padding : posX - this.padding;

        if (this.hasAngle) {
            mesh.rotation.z = rotZ;
            mesh.position.set(positionX, this.spotLightHeight + this.padding, posZ);
        }
        else {
            mesh.position.set(posX, this.spotLightHeight + this.padding, posZ);
        }

        return mesh;
    }

    #buildSupport(posX, posZ) {
        const line = new THREE.LineCurve3(
            new THREE.Vector3(posX, 9, posZ),
            new THREE.Vector3(posX, 10, posZ)
        );
        const mesh = this.#buildTube(line);

        return mesh;
    }

    #buildTube(curve) {
        const tube = new THREE.TubeGeometry(curve, 2, 0.1, 8, true);
        const mesh = new THREE.Mesh(tube, this.material);
        return mesh;
    }

}

export { MyLight };