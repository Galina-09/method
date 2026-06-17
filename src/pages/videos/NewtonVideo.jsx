import React from 'react';
import VideoPage from '../VideoPage';

const NewtonVideo = () => {
  return (
    <VideoPage 
      title="Метод Ньютона" 
      videoSrc="/assets/videos/NYTON.mp4"
      methodTheme="newton"
      methodPath="/newton"
      pdfPath="/assets/information/Teoretichni_Vidomosti_dla_mtyody_NYTONA.pdf"
    />
  );
};

export default NewtonVideo;