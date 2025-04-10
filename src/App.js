import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css"; // CSS 파일 임포트

function App() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFormat, setImageFormat] = useState("image/jpeg");

  // 네 컷 사진 위치 정보 (x, y 좌표)
  const positions = [
    { x: 71, y: 68 },
    { x: 741, y: 68 },
    { x: 71, y: 608 },
    { x: 741, y: 608 },
  ];

  const targetWidth = 654;
  const targetHeight = 523;
  const frameWidth = 1800;
  const frameHeight = 1200;

  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    savePhoto(imageSrc);
  };

  const savePhoto = (photoData) => {
    if (photos.length < 4) {
      setPhotos([...photos, photoData]);
    }
  };

  const resetPhotos = () => {
    setPhotos([]);
    setImageUrl("");
    setSelectedFrame("");
  };

  const selectFrame = (frame) => {
    setSelectedFrame(frame);
  };

  const createCollage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    const frameImg = new Image();
    frameImg.src = selectedFrame;

    let imagesLoaded = 0;

    const drawImages = () => {
      if (imagesLoaded !== photos.length) return;

      photos.forEach((photo, i) => {
        const img = new Image();
        img.src = photo;

        img.onload = () => {
          let newWidth, newHeight, offsetX = 0, offsetY = 0;
          const imgWidth = img.width;
          const imgHeight = img.height;
          const aspectRatio = imgWidth / imgHeight;
          const targetAspectRatio = targetWidth / targetHeight;

          if (aspectRatio > targetAspectRatio) {
            newHeight = targetHeight;
            newWidth = targetHeight * aspectRatio;
            offsetX = (newWidth - targetWidth) / 2;
          } else {
            newWidth = targetWidth;
            newHeight = targetWidth / aspectRatio;
            offsetY = (newHeight - targetHeight) / 2;
          }

          ctx.drawImage(
            img,
            offsetX, offsetY, imgWidth - 2 * offsetX, imgHeight - 2 * offsetY,
            positions[i].x, positions[i].y, targetWidth, targetHeight
          );

          if (i === photos.length - 1) {
            ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
            setImageUrl(canvas.toDataURL(imageFormat));
          }
        };
      });
    };

    frameImg.onload = drawImages;
    photos.forEach(photo => {
      const img = new Image();
      img.src = photo;
      img.onload = () => {
        imagesLoaded++;
        drawImages();
      };
    });
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Apple Gothic, sans-serif" }}>
      <img
        src="/logo.png"
        alt="나희네 네컷 로고"
        style={{ width: "400px", maxWidth: "90%", margin: "20px 0" }}
      />

      {!imageUrl && (
        <div
          style={{
            position: "relative",
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            overflow: "hidden",
            margin: "auto",
            maxWidth: "100%",
          }}
        >
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Captured ${index + 1}`}
              style={{
                position: "absolute",
                top: `${positions[index].y}px`,
                left: `${positions[index].x}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                zIndex: -1,
              }}
            />
          ))}

          {photos.length < 4 && (
            <div
              style={{
                position: "absolute",
                top: `${positions[photos.length].y}px`,
                left: `${positions[photos.length].x}px`,
                width: `${targetWidth}px`,
                height: `${targetHeight}px`,
                border: "2px solid red",
                zIndex: 2,
                overflow: "hidden",
              }}
            >
              <Webcam
                ref={webcamRef}
                screenshotFormat={imageFormat}
                mirrored={true}
                videoConstraints={{ facingMode: "user" }}
                style={{
                  width: "100%",
                  aspectRatio: `${targetWidth / targetHeight}`,
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {selectedFrame && (
            <img
              src={selectedFrame}
              alt="Frame"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                zIndex: 3,
              }}
            />
          )}
        </div>
      )}

      {!imageUrl && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px" }}>
          {photos.length < 4 && (
            <button onClick={capturePhoto} style={{ padding: "10px 20px", fontSize: "1rem" }}>
              📸 사진 찍기
            </button>
          )}
          {photos.length > 0 && (
            <button onClick={resetPhotos} style={{ padding: "10px 20px", fontSize: "1rem" }}>
              다시 찍기
            </button>
          )}
        </div>
      )}

      {!imageUrl && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button onClick={() => selectFrame("/frames/frame1.png")}>필름 프레임</button>
          <button onClick={() => selectFrame("/frames/frame2.png")}>엑스디너리히어로즈 프레임</button>
          <button onClick={() => selectFrame("/frames/frame3.png")}>맥북 프레임</button>
          <button onClick={() => selectFrame("/frames/frame4.png")}>카메라 프레임</button>
          <button onClick={() => selectFrame("/frames/frame5.png")}>인스타그램 프레임</button>
        </div>
      )}

      {photos.length === 4 && selectedFrame && !imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={createCollage}>합성된 사진 만들기</button>
        </div>
      )}

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img src={imageUrl} alt="Collage" style={{ maxWidth: "100%" }} />
          <div style={{ marginTop: "10px" }}>
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
        </div>
      )}
    </div>
  );
}

export default App;
