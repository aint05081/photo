import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css"; // CSS 파일 임포트

function App() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(""); // 선택된 프레임 저장
  const [imageUrl, setImageUrl] = useState(""); // 합성된 이미지 URL 저장
  const [imageFormat, setImageFormat] = useState("image/jpeg"); // 이미지 포맷 설정
  const [showWebcam, setShowWebcam] = useState(true); // 카메라 표시 여부 상태
  const [showPreview, setShowPreview] = useState(true); // 미리보기 상태

  // 캡처할 사진 크기 설정
  const targetWidth = 654;
  const targetHeight = 523;

  // 사진 찍기 함수 (크롭 기능 추가)
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      // 사진 크기가 너무 크면 중앙을 기준으로 크롭
      if (img.width > targetWidth || img.height > targetHeight) {
        sx = (img.width - targetWidth) / 2;
        sy = (img.height - targetHeight) / 2;
        sWidth = targetWidth;
        sHeight = targetHeight;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

      const croppedImage = canvas.toDataURL(imageFormat);
      if (photos.length < 4) {
        setPhotos([...photos, croppedImage]);
      }
    };
  };

  // 다시 찍기 함수
  const resetPhotos = () => {
    setPhotos([]);
    setImageUrl("");
    setSelectedFrame("");
    setShowWebcam(true);
    setShowPreview(true);
  };

  // 프레임 선택 함수
  const selectFrame = (frame) => {
    setSelectedFrame(frame);
  };

  // 합성된 이미지 만들기 (사진을 크롭하여 배치)
  const createCollage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 캔버스 크기 설정
    const frameWidth = 1800;
    const frameHeight = 1200;
    canvas.width = frameWidth;
    canvas.height = frameHeight;

    // 프레임 이미지 불러오기
    const frameImg = new Image();
    frameImg.src = selectedFrame;

    frameImg.onload = () => {
      // 4개의 사진을 캔버스에 먼저 그리기
      for (let i = 0; i < photos.length; i++) {
        const img = new Image();
        img.src = photos[i];

        img.onload = () => {
          const x = i % 2 === 0 ? 71 : 741;
          const y = i < 2 ? 68 : 608;
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight, x, y, targetWidth, targetHeight);

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

  // 네 컷 사진 미리보기 (크롭된 사진 적용)
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
        <Webcam ref={webcamRef} screenshotFormat={imageFormat} width="400px" />
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
