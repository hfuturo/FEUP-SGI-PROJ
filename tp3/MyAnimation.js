import * as THREE from 'three';

class MyAnimation {
    constructor(object) {
        this.object = object;

        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(this.object);
        this.animationPlaying = false;
    }

    isPlaying() {
        return this.animationPlaying;
    }

    createAnimation(times, values, property='position') {
        if (this.isPlaying()) 
            throw new Error('Animation is already playing');

        let kf;

        if (property === 'rotation') {
            const quaternionValues = [];
            for (let i = 0; i < values.length; i += 3) {
                const euler = new THREE.Euler(values[i], values[i + 1], values[i + 2]);
                const quaternion = new THREE.Quaternion().setFromEuler(euler);
                quaternionValues.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
            }
            kf = new THREE.QuaternionKeyframeTrack('.quaternion', times, quaternionValues);
        } else {
            kf = new THREE.VectorKeyframeTrack(`.${property}`, times, values, THREE.InterpolateSmooth);
        }

        const clip = new THREE.AnimationClip(`${property}Animation`, -1, [kf])

        const action = this.mixer.clipAction(clip)
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        this.animationPlaying = true;

        const onFinished = () => {
            this.stopAnimation(property);
        };
        this.mixer.addEventListener('finished', onFinished);

        this.stopAnimation = () => {
            this.animationPlaying = false;
            this.mixer.stopAllAction();
            if (property === 'rotation') {
                const euler = new THREE.Euler(values.at(-3), values.at(-2), values.at(-1));
                this.object.quaternion.setFromEuler(euler);
            } else {
                this.object[property].set(values.at(-3), values.at(-2), values.at(-1));
            }
            this.mixer.removeEventListener('finished', onFinished);
        };

        action.play()
    }

    update() {
        this.mixer.update(this.clock.getDelta());
    }

}

export { MyAnimation };