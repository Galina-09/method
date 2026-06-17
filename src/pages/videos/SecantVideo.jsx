import React from 'react';
import VideoPage from '../VideoPage';

const SecantVideo = () => {
  return (
    <VideoPage 
      title="Метод Хорд" 
      videoSrc="/assets/videos/HORD.mp4"
      methodTheme="secant"
      methodPath="/secant"
      pdfPath="/assets/information/Teoretichni_Vidomosti_dla_mtyody_HORD.pdf"
    />
  );
};

export default SecantVideo;