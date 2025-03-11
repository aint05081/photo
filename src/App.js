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
      // 프레임 이미지를 캔버스에 그리기
      ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);

      // 4개의 사진을 캔버스에 그리기
      for (let i = 0; i < photos.length; i++) {
        const img = new Image();
        img.src = photos[i];
        img.onload = () => {
          const x = i % 2 === 0 ? 71 : 741; // 첫 번째, 세 번째 사진 위치
          const y = i < 2 ? 68 : 608; // 첫 번째, 두 번째 사진 위치
          ctx.drawImage(img, x, y, 654, 523); // 사진을 캔버스에 그리기
          if (i === 3) {
            // 마지막 사진이 그려진 후 이미지 URL 설정
            const url = canvas.toDataURL(imageFormat); // 선택된 포맷으로 데이터 URL 생성
            setImageUrl(url); // 이미지 URL을 상태에 저장
          }
        };
      }
    };
  };

  // 사진 다운로드 함수
  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl; // 저장할 이미지의 URL
    link.download = "collage.jpg"; // 다운로드할 파일 이름 설정
    link.click(); // 다운로드 시작
  };

  // 사진 포맷 선택
  const handleFormatChange = (format) => {
    setImageFormat(format);
  };

  // 찍은 네 컷 사진 2x2 배열로 출력
  const renderPhotos = () => {
    return (
      <div
        style={{
          position: "relative", // 프레임과 사진을 절대 위치로 배치
          width: "1800px", // 프레임 크기: 1800px
          height: "1200px", // 프레임 크기: 1200px
          margin: "20px auto",
        }}
      >
        {photos.length > 0 && (
          <>
            {/* 첫 번째 사진 */}
            <img
              src={photos[0]}
              alt="Captured 1"
              style={{
                position: "absolute",
                top: "68px", // 첫 번째 사진 위치
                left: "71px", // 첫 번째 사진 위치
                width: "654px", // 사진 크기
                height: "523px", // 사진 크기
                objectFit: "cover", // 사진 크기 맞추기
                zIndex: 1, // 사진을 프레임 뒤로 배치
              }}
            />
            {/* 두 번째 사진 */}
            {photos[1] && (
              <img
                src={photos[1]}
                alt="Captured 2"
                style={{
                  position: "absolute",
                  top: "68px", // 두 번째 사진 위치
                  left: "741px", // 두 번째 사진 위치
                  width: "654px", // 사진 크기
                  height: "523px", // 사진 크기
                  objectFit: "cover", // 사진 크기 맞추기
                  zIndex: 1, // 사진을 프레임 뒤로 배치
                }}
              />
            )}
            {/* 세 번째 사진 */}
            {photos[2] && (
              <img
                src={photos[2]}
                alt="Captured 3"
                style={{
                  position: "absolute",
                  top: "608px", // 세 번째 사진 위치
                  left: "71px", // 세 번째 사진 위치
                  width: "654px", // 사진 크기
                  height: "523px", // 사진 크기
                  objectFit: "cover", // 사진 크기 맞추기
                  zIndex: 1, // 사진을 프레임 뒤로 배치
                }}
              />
            )}
            {/* 네 번째 사진 */}
            {photos[3] && (
              <img
                src={photos[3]}
                alt="Captured 4"
                style={{
                  position: "absolute",
                  top: "608px", // 네 번째 사진 위치
                  left: "741px", // 네 번째 사진 위치
                  width: "654px", // 사진 크기
                  height: "523px", // 사진 크기
                  objectFit: "cover", // 사진 크기 맞추기
                  zIndex: 1, // 사진을 프레임 뒤로 배치
                }}
              />
            )}
          </>
        )}
        {/* 프레임이 사진 뒤로 가는 문제 해결 */}
        {selectedFrame && (
          <img
            src={selectedFrame}
            alt="Selected Frame"
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 10, // 프레임을 맨 앞으로
            }}
          />
        )}
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

      {/* 사진 찍기 및 다시 찍기 버튼들 */}
      {!imageUrl && (
        <>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={capturePhoto}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              📸 사진 찍기
            </button>
            {photos.length > 0 && (
              <button
                onClick={resetPhotos}
                style={{
                  marginLeft: "10px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                다시 찍기
              </button>
            )}
          </div>

          {/* 프레임 선택 */}
          <div style={{ marginTop: "20px" }}>
            <button onClick={() => selectFrame("/frames/frame1.png")}>프레임 1 선택</button>
            <button onClick={() => selectFrame("/frames/frame2.jpeg")}>프레임 2 선택</button>
            <button onClick={() => selectFrame("/frames/frame3.jpeg")}>프레임 3 선택</button>
          </div>

          {/* 합성된 사진 만들기 */}
          {photos.length === 4 && selectedFrame && (
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={createCollage}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                합성된 사진 만들기
              </button>
            </div>
          )}
        </>
      )}

      {/* 네 컷 사진 합성 후 이미지 출력 */}
      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img src={imageUrl} alt="Collage" style={{ marginTop: "20px", maxWidth: "100%" }} />
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={downloadImage}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              다운로드
            </button>
            <button
              onClick={resetPhotos}
              style={{
                marginLeft: "10px",
                padding: "8px 16px",
                fontSize: "14px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              다시 찍기
            </button>
          </div>
        </div>
      )}

      {/* 사진 포맷 선택 */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => handleFormatChange("image/jpeg")}>JPEG 포맷</button>
        <button onClick={() => handleFormatChange("image/png")}>PNG 포맷</button>
      </div>

      {/* 찍은 네 컷 사진 2x2 배열로 표시 */}
      {!imageUrl && (
        <div style={{ marginTop: "20px" }}>
          {renderPhotos()}
        </div>
      )}
    </div>
  );
}

export default App;
