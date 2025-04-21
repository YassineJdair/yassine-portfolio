import React from "react";
import CrossyRoad from "@/components/CrossyRoad";
import Layout from "@/components/Layout";

const CrossyRoadPage = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen">
        <CrossyRoad />
      </div>
    </Layout>
  );
};

export default CrossyRoadPage;
