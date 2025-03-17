import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css"; // CSS 파일 임포트

function App() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(""); // 선택된 프레임 저장
  const [imageUrl, setImageUrl] = useState(""); // 합성된 이미지 URL 저장
  const [imageFormat, setImageFormat] = useState("image/jpeg"); // 이미지 포맷 설정

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

  // 사진 찍기 함수
  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    savePhoto(imageSrc);
  };

  // 찍은 사진 저장 함수
  const savePhoto = (photoData) => {
    if (photos.length < 4) {
      setPhotos([...photos, photoData]);
    }
  };

  // 다시 찍기 함수
  const resetPhotos = () => {
    setPhotos([]);
    setImageUrl("");
    setSelectedFrame("");
  };

  // 프레임 선택 함수
  const selectFrame = (frame) => {
    setSelectedFrame(frame);
  };

  // 합성된 이미지 만들기
  const createCollage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    const frameImg = new Image();
    frameImg.src = selectedFrame;

    frameImg.onload = () => {
      photos.forEach((photo, i) => {
        const img = new Image();
        img.src = photo;

        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let newWidth, newHeight, offsetX = 0, offsetY = 0;

          ctx.drawImage(
            img,
            offsetX,
            offsetY,
            newWidth - 2 * offsetX,
            newHeight - 2 * offsetY,
            positions[i].x,
            positions[i].y,
            targetWidth,
            targetHeight
          );

          if (i === 3) {
            ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
            setImageUrl(canvas.toDataURL(imageFormat));
          }
        };
      });
    };
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "Apple Gothic, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", margin: "20px 0" }}>나희네 네컷</h1>

      {!imageUrl && (
        <div
          style={{
            position: "relative",
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            overflow: "hidden",
            margin: "auto",
          }}
        >
          {/* 찍은 사진 미리보기 (4컷 다 찍어도 유지됨) */}
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
                zIndex: 1, // 사진이 프레임보다 뒤에 배치됨
                transform: "scaleX(1)", // 좌우반전 유지
              }}
            />
          ))}

          {/* 웹캠 (4컷 다 찍으면 안 보이도록 설정) */}
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
              }}
            >
              <Webcam
                ref={webcamRef}
                screenshotFormat={imageFormat}
                width={targetWidth}
                height={targetHeight}
                mirrored={true}
                videoConstraints={{
                  width: targetWidth,
                  height: targetHeight,
                  facingMode: "user",
                }}
              />
            </div>
          )}

          {/* 웹캠 위에 반투명한 프레임 오버레이 추가 */}
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
                zIndex: 3, // 프레임이 제일 앞에 배치됨
                opacity: 1, // 프레임 반투명 설정
              }}
            />
          )}
        </div>
      )}

      {/* 버튼 UI */}
      {!imageUrl && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
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

      {/* 프레임 선택 버튼 */}
      {!imageUrl && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <button onClick={() => selectFrame("/frames/frame1.png")}>필름 프레임</button>
          <button onClick={() => selectFrame("/frames/frame2.png")}>엑스디너리 히어로즈 승민 프레임</button>
          <button onClick={() => selectFrame("/frames/frame3.png")}>프레임 3 선택</button>
        </div>
      )}

      {/* 합성된 이미지 만들기 버튼 */}
      {photos.length === 4 && selectedFrame && !imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={createCollage}>합성된 사진 만들기</button>
        </div>
      )}

      {/* 합성된 이미지 표시 및 다운로드 */}
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
    </div>
  );
}

export default App;