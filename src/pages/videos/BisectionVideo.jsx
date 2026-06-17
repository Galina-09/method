import React from 'react';
import VideoPage from '../VideoPage';

const BisectionVideo = () => {
  return (
    <VideoPage 
      title="Метод Половинного Ділення" 
      videoSrc="/assets/videos/POLOVINNE_DILENNA.mp4"
      methodTheme="bisection"
      methodPath="/bisection"
      pdfPath="/assets/information/Teoretichni_Vidomosti_dla_mtyody_POLOVINNOGO_DILENNA.pdf"
    />
  );
};

export default BisectionVideo;