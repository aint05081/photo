import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

const commonButtonStyle = {
  padding: "15px 30px",
  fontSize: "1.4rem",
  fontWeight: "bold",
  backgroundColor: "#fce4ec",
  border: "3px solid #f8bbd0",
  color: "#4a148c",
  borderRadius: "20px",
  cursor: "pointer",
  boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
  fontFamily: "'Gaegu', cursive"
};

const frameOptions = [
  { name: "뷰티풀 마인드", file: "frame1.png" },
  { name: "기본1", file: "frame3.png" },
  { name: "기본2", file: "frame4.png" },
  { name: "기본3", file: "frame5.png" },
];

function App() {
  const webcamRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [appState, setAppState] = useState("initial");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [imageQrUrl, setImageQrUrl] = useState("");
  const [videoQrUrl, setVideoQrUrl] = useState("");
  const imageFormat = "image/jpeg";

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

  useEffect(() => {
    if (appState === "recording") {
      const interval = setInterval(() => {
        if (webcamRef.current?.video?.srcObject && !mediaRecorder) {
          startRecording();
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [appState, mediaRecorder]);

  const startRecording = () => {
    const stream = webcamRef.current?.video?.srcObject;
    if (!stream || !(stream instanceof MediaStream)) return;

    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      try {
        const uploadUrl = await uploadToTransferSh(blob, "video.webm");
        const shortUrl = await shortenWithTnyIm(uploadUrl);
        setVideoQrUrl(shortUrl);
      } catch (err) {
        console.error("영상 업로드 실패", err);
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    if (mediaRecorder) mediaRecorder.stop();
  };

  const handleStart = () => {
    if (!selectedFrame) return alert("프레임을 먼저 선택해주세요");
    setAppState("recording");
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setPhotos((prev) => {
      const newPhotos = [...prev, imageSrc];
      if (newPhotos.length === 4) {
        stopRecording();
        createCollage(newPhotos);
        setAppState("done");
      }
      return newPhotos;
    });
  };

  const createCollage = async (photos) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = frameWidth;
    canvas.height = frameHeight;

    const loadImage = (src) => new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });

    try {
      const frameImg = await loadImage(selectedFrame);
      const loadedImages = await Promise.all(photos.map(loadImage));

      loadedImages.forEach((img, i) => {
        let newWidth, newHeight, offsetX = 0, offsetY = 0;
        const aspectRatio = img.width / img.height;
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
          offsetX,
          offsetY,
          img.width - 2 * offsetX,
          img.height - 2 * offsetY,
          positions[i].x,
          positions[i].y,
          targetWidth,
          targetHeight
        );
      });

      ctx.drawImage(frameImg, 0, 0, frameWidth, frameHeight);
      const dataUrl = canvas.toDataURL(imageFormat);
      setImageUrl(dataUrl);

      const blob = await (await fetch(dataUrl)).blob();
      const uploadUrl = await uploadToTransferSh(blob, "collage.jpg");
      const shortUrl = await shortenWithTnyIm(uploadUrl);
      setImageQrUrl(shortUrl);
    } catch (err) {
      console.error("콜라주 생성 실패", err);
    }
  };

  async function uploadToTransferSh(blob, filename) {
    const formData = new FormData();
    formData.append("file", blob, filename);
    const res = await fetch(`https://transfer.sh/${filename}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("upload failed");
    return (await res.text()).trim();
  }

  async function shortenWithTnyIm(longUrl) {
    const res = await fetch(`https://tny.im/yourls-api.php?format=simple&action=shorturl&url=${encodeURIComponent(longUrl)}`);
    if (!res.ok) throw new Error("shorten failed");
    return (await res.text()).trim();
  }

  const resetAll = () => {
    setPhotos([]);
    setImageUrl("");
    setVideoUrl("");
    setSelectedFrame("");
    setImageQrUrl("");
    setVideoQrUrl("");
    setAppState("initial");
    setMediaRecorder(null);
  };

  return (
    <div style={{
      textAlign: "center",
      paddingBottom: "180px",
      backgroundImage: "url('/frames/farm-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh"
    }}>
      <img
        src="/logo.png"
        alt="나희네 네컷 로고"
        style={{ width: "400px", maxWidth: "90%", margin: "20px 0" }}
      />

      {appState === "initial" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginTop: "40px" }}>
          <button onClick={handleStart} disabled={!selectedFrame} style={commonButtonStyle}>
            Start
          </button>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            {frameOptions.map((frame, idx) => {
              const path = `/frames/${frame.file}`;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedFrame(path)}
                  style={{
                    ...commonButtonStyle,
                    borderColor: selectedFrame === path ? "#ec407a" : "#f8bbd0",
                    backgroundColor: selectedFrame === path ? "#fff0f5" : "#fce4ec"
                  }}
                >
                  {frame.name}
                </button>
              );
            })}
          </div>

          {selectedFrame && (
            <div style={{ marginTop: "20px" }}>
              <img src={selectedFrame} alt="선택된 프레임 미리보기" style={{ maxWidth: "90%", border: "3px solid #ec407a" }} />
              <p style={{ fontSize: "1.1rem", marginTop: "5px", color: "#000" }}>선택된 프레임 미리보기</p>
            </div>
          )}
        </div>
      )}

      {appState === "recording" && (
        <div style={{
          position: "relative", width: `${frameWidth}px`, height: `${frameHeight}px`,
          margin: "auto", maxWidth: "100%", border: "2px solid gray"
        }}>
          {photos.map((photo, index) => (
            <img key={index} src={photo} alt="snap" style={{
              position: "absolute", top: `${positions[index].y}px`, left: `${positions[index].x}px`,
              width: `${targetWidth}px`, height: `${targetHeight}px`, zIndex: 1
            }} />
          ))}
          {photos.length < 4 && (
            <div style={{
              position: "absolute", top: `${positions[photos.length].y}px`, left: `${positions[photos.length].x}px`,
              width: `${targetWidth}px`, height: `${targetHeight}px`, border: "2px solid #f48fb1", zIndex: 2
            }}>
              <Webcam ref={webcamRef} screenshotFormat={imageFormat} mirrored={true}
                videoConstraints={{ facingMode: "user" }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <img src={selectedFrame} alt="frame"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 3 }} />
          {photos.length < 4 && (
            <button onClick={capturePhoto}
              style={{ ...commonButtonStyle, position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", zIndex: 4 }}>
              📸 사진 찍기
            </button>
          )}
        </div>
      )}

      {appState === "done" && (
        <>
          <img src={imageUrl} alt="Collage" />
          {imageQrUrl && (
            <div style={{ border: "4px dashed #ec407a", padding: "10px", display: "inline-block", marginTop: "10px" }}>
              <QRCodeCanvas value={imageQrUrl} size={128} />
              <p style={{ fontSize: "1rem", marginTop: "5px", color: "#000" }}>📱 사진 다운로드</p>
            </div>
          )}

          <video src={videoUrl} controls style={{ maxWidth: "100%", transform: "scaleX(-1)", marginTop: "30px" }} />
          {videoQrUrl && (
            <div style={{ border: "4px dashed #ec407a", padding: "10px", display: "inline-block", marginTop: "10px" }}>
              <QRCodeCanvas value={videoQrUrl} size={128} />
              <p style={{ fontSize: "1rem", marginTop: "5px", color: "#000" }}>📱 영상 다운로드</p>
            </div>
          )}

          <div style={{ marginTop: 30 }}>
            <button onClick={() => {
              const link = document.createElement("a");
              link.href = imageUrl;
              link.download = "collage.jpg";
              link.click();
            }} style={commonButtonStyle}>
              📥 사진 저장
            </button>
            <button onClick={() => {
              const link = document.createElement("a");
              link.href = videoUrl;
              link.download = "video.webm";
              link.click();
            }} style={{ ...commonButtonStyle, marginLeft: "10px" }}>
              📥 영상 저장
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={resetAll} style={commonButtonStyle}>🔄 다시 시작</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
