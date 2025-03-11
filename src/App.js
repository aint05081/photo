import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css"; // CSS 파일 임포트

function App() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFormat, setImageFormat] = useState("image/jpeg");
  const [showWebcam, setShowWebcam] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const targetWidth = 654;
  const targetHeight = 523;

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let sx = 0,
        sy = 0,
        sWidth = img.width,
        sHeight = img.height;

      if (img.width > targetWidth || img.height > targetHeight) {
        sx = (img.width - targetWidth) / 2;
        sy = (img.height - targetHeight) / 2;
        sWidth = targetWidth;
        sHeight = targetHeight;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.save();
      ctx.translate(targetWidth, 0);
      ctx.scale(-1, 1); // 사진 찍을 때 좌우반전 적용
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      ctx.restore();

      const flippedImage = canvas.toDataURL(imageFormat);
      if (photos.length < 4) {
        setPhotos([...photos, flippedImage]);
      }
    };
  };

  const resetPhotos = () => {
    setPhotos([]);
    setImageUrl("");
    setSelectedFrame("");
    setShowWebcam(true);
    setShowPreview(true);
  };

  const selectFrame = (frame) => {
    setSelectedFrame(frame);
  };

  const createCollage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const frameWidth = 1800;
    const frameHeight = 1200;
    canvas.width = frameWidth;
    canvas.height = frameHeight;

    const frameImg = new Image();
    frameImg.src = selectedFrame;

    frameImg.onload = () => {
      for (let i = 0; i < photos.length; i++) {
        const img = new Image();
        img.src = photos[i];

        img.onload = () => {
          const x = i % 2 === 0 ? 71 : 741;
          const y = i < 2 ? 68 : 608;

          ctx.save();
          ctx.translate(x + targetWidth, y); // 위치 유지한 채 좌우반전
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          ctx.restore();

          if (i === 3) {
            ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
            const url = canvas.toDataURL(imageFormat);
            setImageUrl(url);
            setShowPreview(false);
          }
        };
      }
    };
  };

  const renderPhotos = () => {
    return (
      <div style={{ position: "relative", width: "1800px", height: "1200px", margin: "20px auto" }}>
        {selectedFrame && (
          <img
            src={selectedFrame}
            alt="Frame"
            style={{
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "1800px",
              height: "1200px",
              zIndex: 1,
            }}
          />
        )}

        {photos.map((photo, index) => {
          const x = index % 2 === 0 ? 71 : 741;
          const y = index < 2 ? 68 : 608;
          return (
            <img
              key={index}
              src={photo}
              alt={`Captured ${index + 1}`}
              style={{
                position: "absolute",
                top: `${y}px`,
                left: `${x}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                objectFit: "cover",
                transform: "scaleX(-1)", // 미리보기에서만 좌우반전
                zIndex: 0,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Apple Gothic, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", margin: "20px 0" }}>나희네 네컷</h1>

      {showWebcam && photos.length < 4 && (
        <Webcam ref={webcamRef} screenshotFormat={imageFormat} width="400px" mirrored={true} />
      )}

      {!imageUrl && (
        <>
          <div style={{ marginTop: "20px" }}>
            <button onClick={capturePhoto}>📸 사진 찍기</button>
            {photos.length > 0 && <button onClick={resetPhotos}>다시 찍기</button>}
          </div>

          <div style={{ marginTop: "20px" }}>
            <button onClick={() => selectFrame("/frames/frame1.png")}>프레임 1 선택</button>
            <button onClick={() => selectFrame("/frames/frame2.png")}>프레임 2 선택</button>
            <button onClick={() => selectFrame("/frames/frame3.png")}>프레임 3 선택</button>
          </div>

          {photos.length === 4 && selectedFrame && (
            <button onClick={createCollage}>합성된 사진 만들기</button>
          )}
        </>
      )}

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img src={imageUrl} alt="Collage" style={{ maxWidth: "100%" }} />
          <button onClick={resetPhotos}>다시 찍기</button>
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = imageUrl;
              link.download = "collage.jpg";
              link.click();
            }}
          >
            다운로드
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setImageFormat("image/jpeg")}>JPEG 포맷</button>
        <button onClick={() => setImageFormat("image/png")}>PNG 포맷</button>
      </div>

      {showPreview && renderPhotos()}
    </div>
  );
}

export default App;
