import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css"; // CSS 파일 임포트

function App() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(""); // 선택된 프레임 저장
  const [imageUrl, setImageUrl] = useState(""); // 합성된 이미지 URL 저장
  const [imageFormat, setImageFormat] = useState("image/jpeg"); // 이미지 포맷 설정 (기본은 JPEG)
  const [showWebcam, setShowWebcam] = useState(true); // 카메라 표시 여부 상태
  const [showPreview, setShowPreview] = useState(true); // 미리보기 상태

  // 사진 찍기 함수
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (photos.length < 4) {
      setPhotos([...photos, imageSrc]);
    }
  };

  // 다시 찍기 함수 (사진 초기화)
  const resetPhotos = () => {
    setPhotos([]); // 사진 초기화
    setImageUrl(""); // 합성된 이미지 초기화
    setSelectedFrame(""); // 선택된 프레임 초기화
    setShowWebcam(true); // 카메라 다시 표시
    setShowPreview(true); // 미리보기 다시 표시
  };

  // 프레임 선택 함수
  const selectFrame = (frame) => {
    setSelectedFrame(frame);
  };

  // 합성된 이미지를 생성하고 URL을 설정하는 함수
  const createCollage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 프레임 크기와 위치 설정
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
          const x = i % 2 === 0 ? 71 : 741; // 첫 번째, 세 번째 사진 위치
          const y = i < 2 ? 68 : 608; // 첫 번째, 두 번째 사진 위치
          ctx.drawImage(img, x, y, 654, 523); // 사진을 캔버스에 그리기
          if (i === 3) {
            // 마지막 사진이 그려진 후 프레임을 (0,0)에 위치
            ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
            const url = canvas.toDataURL(imageFormat); // 선택된 포맷으로 데이터 URL 생성
            setImageUrl(url); // 이미지 URL을 상태에 저장
            setShowPreview(false); // 미리보기 사진 사라짐
          }
        };
      }
    };
  };

  // 네 컷 사진 미리보기 렌더링 (프레임이 사진 뒤로 가도록 설정)
  const renderPhotos = () => {
    return (
      <div
        style={{
          position: "relative",
          width: "1800px",
          height: "1200px",
          margin: "20px auto",
        }}
      >
        {/* 프레임 (항상 뒤에 위치) */}
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
              zIndex: 1, // 프레임을 사진보다 뒤로 보이게
            }}
          />
        )}

        {/* 4개의 사진 */}
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
                width: "654px",
                height: "523px",
                objectFit: "cover",
                zIndex: 0, // 사진이 프레임 위에 위치
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

      {/* 카메라 화면 (4장 찍을 때까지 카메라 표시) */}
      {showWebcam && photos.length < 4 && (
        <Webcam ref={webcamRef} screenshotFormat={imageFormat} width="400px" />
      )}

      {/* 사진 찍기 및 다시 찍기 버튼 */}
      {!imageUrl && (
        <>
          <div style={{ marginTop: "20px" }}>
            <button onClick={capturePhoto}>📸 사진 찍기</button>
            {photos.length > 0 && <button onClick={resetPhotos}>다시 찍기</button>}
          </div>

          {/* 프레임 선택 */}
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => selectFrame("/frames/frame1.png")}>프레임 1 선택</button>
            <button onClick={() => selectFrame("/frames/frame2.png")}>프레임 2 선택</button>
            <button onClick={() => selectFrame("/frames/frame3.png")}>프레임 3 선택</button>
          </div>

          {/* 합성된 사진 만들기 */}
          {photos.length === 4 && selectedFrame && (
            <button onClick={createCollage}>합성된 사진 만들기</button>
          )}
        </>
      )}

      {/* 합성된 사진 출력 */}
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

      {/* 사진 포맷 선택 */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setImageFormat("image/jpeg")}>JPEG 포맷</button>
        <button onClick={() => setImageFormat("image/png")}>PNG 포맷</button>
      </div>

      {/* 미리보기 */}
      {showPreview && renderPhotos()}
    </div>
  );
}

export default App;
