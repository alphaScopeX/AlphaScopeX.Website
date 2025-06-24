"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function Home() {
  return (
    <div
      id="home-title-wrapper"
      className={`px-3 py-4 w-full h-screen relative`}
    >
      <div
        id="light-shader"
        className={`h-full w-full dark:hidden overflow-hidden border-2 rounded-2xl`}
      >
        <ShaderGradientCanvas
          style={{
            position: "relative",
            inset: 0,
            top: 0,
            zIndex: 5,
          }}
          pointerEvents="none"
        >
          <ShaderGradient
            control="query"
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.7&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23606080&color2=%238d7dca&color3=%23212121&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1.1&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.4&uFrequency=0&uSpeed=0.3&uStrength=1.2&uTime=8&wireframe=false"
          />
        </ShaderGradientCanvas>
      </div>
      <div
        id="dark-shader"
        className={`hidden dark:block h-full w-full overflow-hidden border-2 rounded-2xl`}
      >
        <ShaderGradientCanvas
          style={{
            position: "relative",
            inset: 0,
            top: 0,
            zIndex: 5,
          }}
          pointerEvents="none"
        >
          <ShaderGradient
            control="query"
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.1&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23606080&color2=%238d7dca&color3=%23212121&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1.1&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.4&uFrequency=0&uSpeed=0.3&uStrength=1.2&uTime=8&wireframe=false"
          />
        </ShaderGradientCanvas>
      </div>
    </div>
  );
}
