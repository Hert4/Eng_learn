import { useEffect } from 'react'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import { MotionSync } from "live2d-motionsync";

window.PIXI = PIXI

Live2DModel.registerTicker(PIXI.Ticker)

PIXI.Renderer.registerPlugin("interaction", PIXI.InteractionManager);



function Live2DComponent() {
    useEffect(() => {
        const app = new PIXI.Application({
            view: document.getElementById("canvas"),
            autoStart: true,
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            antialias: true,
            transparent: true,
            backgroundAlpha: 0,
        });

        // Set FPS limits
        app.ticker.minFPS = 60; // Minimum FPS
        app.ticker.maxFPS = 120; // Maximum FPS

        Live2DModel.from("Firefly/Firefly.model3.json", {
            idleMotionGroup: "Idle"
        }).then((model) => {
            app.stage.addChild(model);
            model.anchor.set(0.5, 0.5);
            model.position.set(window.innerWidth / 2, window.innerHeight / 2);

            // Initial scale based on device type
            const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
            const baseScale = isMobile ? 0.4 : 0.3; // Larger scale for mobile
            model.scale.set(baseScale, baseScale);

            const motionSync = new MotionSync(model.internalModel);
            motionSync.loadMotionSyncFromUrl("Firefly/Firefly.motionsync3.json");

            let currentMotion = null;
            model.on("pointertap", async () => {
                if (currentMotion) {
                    motionSync.reset();
                    await model.motion('Motion_1');
                    currentMotion = null;
                    console.log("Stopped");
                } else {
                    model.motion("Talk");
                    currentMotion = motionSync.play();
                    await currentMotion.then(() => {
                        currentMotion = null;
                        console.log("Finished playing");
                    });

                    console.log("Playing");
                }
            });

            // Add resize listener for responsiveness
            // const onResize = () => {
            //     model.position.set(window.innerWidth / 2, window.innerHeight / 2);
            //     const isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
            //     const scaleFactor = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
            //     const adjustedScale = isMobile ? 0.4 * scaleFactor : 0.25 * scaleFactor; // Larger scale for mobile
            //     model.scale.set(adjustedScale, adjustedScale);
            // };

            // window.addEventListener("resize", onResize);

            // Cleanup on component unmount
            return () => {
                // window.removeEventListener("resize", onResize);
                app.destroy(true, { children: true });
            };
        });
    }, []);

    return (
        <>

            <canvas
                id="canvas"
                style={{
                    // zIndex: 9999,
                    position: 'relative',
                    bottom: 0,
                    // left: 12,
                    width: '600px', // Cố định chiều rộng
                    height: 'auto' // Cố định chiều cao
                }}
            />
        </>
    )

}

export default Live2DComponent
