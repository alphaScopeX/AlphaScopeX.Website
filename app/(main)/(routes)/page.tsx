"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Krona_One } from "next/font/google";

const kronaOne = Krona_One({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const t = useTranslations("homePage");

  return (
    <div
      id="home-title-wrapper"
      className={`px-3 py-4 w-full h-screen relative`}
    >
      <div
        id="light-shader"
        className={`absolute inset-y-4 inset-x-3 dark:hidden overflow-hidden border-2 rounded-2xl`}
      >
        <ShaderGradientCanvas
          style={{
            position: "relative",
            inset: 0,
            top: 0,
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
        className={`absolute inset-y-4 inset-x-3 hidden dark:block overflow-hidden border-2 rounded-2xl`}
      >
        <ShaderGradientCanvas
          style={{
            position: "relative",
            inset: 0,
            top: 0,
          }}
          pointerEvents="none"
        >
          <ShaderGradient
            control="query"
            urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.1&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23606080&color2=%238d7dca&color3=%23212121&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1.1&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.4&uFrequency=0&uSpeed=0.3&uStrength=1.2&uTime=8&wireframe=false"
          />
        </ShaderGradientCanvas>
      </div>
      <div
        id="title-wrapper"
        className={`relative z-10 w-full h-full text-foreground flex justify-center items-center
          flex-col gap-5`}
      >
        <h1 className={cn(`${kronaOne.className}`, `text-5xl`)}>
          {t("title")}
        </h1>
        <p className={cn(`text-lg`)}>{t("description")}</p>
        <div className={`flex gap-9`}>
          <Button className={`cursor-pointer p-5`} variant={`default`}>
            {t("buttons.createStrategies")}
            <ArrowRight />
          </Button>
          <Button className={`cursor-pointer p-5`} variant={`outline`}>
            {t("buttons.trendingAssets")}
          </Button>
        </div>
      </div>
    </div>
  );
}
