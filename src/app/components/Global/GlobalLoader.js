import React from "react";
import animationData from "../../resources/ai-orb-loading.json";
import { useAppContext } from "../../AppContext";
import dynamic from "next/dynamic";



const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

const GlobalLoader = () => {
  const { isLoading } = useAppContext();

  if (!isLoading) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <Lottie animationData={animationData} loop={true} style={{ width: 200, height: 200 }} />
    </div>
  );
};

export default GlobalLoader;