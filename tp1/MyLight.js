import * as THREE from 'three';

class MyLight {

    /**
     * Creates an instance of MyLight.
     * 
     * @constructor
     * @param {MyApp} app - The application context.
     * @param {Array<number>} targetPosition - The position of the target that will be illuminated.
     * @param {number} intensity - The intensity of the light.
     * @param {number} distance - The maximum range of the light.
     * @param {number} angle - The angle of light dispersion from its direction.
     * @param {number} penumbra - The Percent of the SpotLight cone that is attenuated due to penumbra.
     * @param {number} decay - The amount the light dims along the distance of the light.
     * @param {boolean} [castShadow=false] - Whether the light casts shadows.
     * @param {boolean} [hasAngle=true] - Whether the light has an angle.
     */
    constructor(app, targetPosition, intensity, distance, angle, penumbra, decay, castShadow=false, hasAngle=true) {
        this.app = app;
        this.targetPosition = targetPosition;
        this.castShadow = castShadow;
        this.hasAngle = hasAngle;
        
        this.barrierX = 4;
        this.padding = 0.3;
        this.spotLightHeight = 9;

        this.material = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/support.jpg')
        });

        this.endingMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0xFFFFFF
        });

        this.spotLight = new THREE.SpotLight(0xFFFFFF, intensity, distance, angle, penumbra, decay);
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
        this.spotLight.castShadow = this.castShadow;

        const ending = new THREE.CylinderGeometry(0.1, 0.1, 0.01, 24);
        const endingMesh = new THREE.Mesh(ending, this.endingMaterial);
        const begginingMesh = new THREE.Mesh(ending, this.material);

        if (this.hasAngle) {
            endingMesh.material.side = THREE.DoubleSide;

            this.spotLight.position.set(positionX, this.spotLightHeight - this.padding, posZ);
            this.spotLight.target.position.set(targetPosX, this.targetPosition[1] + 0.5, Math.abs(this.targetPosition[0]));

            if (posX > 0) {
                endingMesh.position.set(positionX + 0.11, this.spotLightHeight - this.padding - 0.11, posZ);
                begginingMesh.position.set(positionX - 0.6, this.spotLightHeight + this.padding, posZ);
                endingMesh.rotation.z = Math.PI / 4;
                begginingMesh.rotation.z = Math.PI / 4;
            }
            else {
                endingMesh.position.set(positionX - 0.11, this.spotLightHeight - this.padding - 0.11, posZ);
                begginingMesh.position.set(positionX + 0.6, this.spotLightHeight + this.padding, posZ);
                endingMesh.rotation.z = -Math.PI / 4;
                begginingMesh.rotation.z = -Math.PI / 4;
            }
        }
        else {
            this.spotLight.position.set(this.targetPosition[0], this.spotLightHeight - this.padding, posZ);
            endingMesh.position.set(this.targetPosition[0], this.spotLightHeight - this.padding - 0.4, posZ);
            begginingMesh.position.set(this.targetPosition[0] ,this.spotLightHeight, posZ);
            this.spotLight.target.position.set(...this.targetPosition);
        }

        this.spotLight.target.updateMatrixWorld();


        const group = new THREE.Group();
        group.add(this.spotLight);
        group.add(endingMesh);
        group.add(begginingMesh);

        return group;
    }

    // builds the MyLight object
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

    // builds connection to the MyLightsSupport object
    #buildSupport(posX, posZ) {
        const line = new THREE.LineCurve3(
            new THREE.Vector3(posX, 9, posZ),
            new THREE.Vector3(posX, 10, posZ)
        );
        const mesh = this.#buildTube(line);

        return mesh;
    }

    #buildTube(curve) {
        const tube = new THREE.TubeGeometry(curve, 2, 0.1, 24, true);
        const mesh = new THREE.Mesh(tube, this.material);
        return mesh;
    }

}

export { MyLight };