import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = //cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js;

function App() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          fullText += strings.join(" ") + "\n";
        }

        setText(fullText);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleReadAloud = () => {
    if (!text) return;
    const speech = new SpeechSynthesisUtterance(text);
    speechRef.current = speech;
    speech.lang = "cs-CZ";
    speech.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
    setIsSpeaking(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ padding: 30, fontFamily: 'Arial' }}>
      <h2>📖 Nahrát PDF a nechat přečíst</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <div style={{ marginTop: 20 }}>
        <button onClick={handleReadAloud} disabled={isSpeaking || !text}>▶️ Přečíst</button>
        <button onClick={handleStop} disabled={!isSpeaking}>⏹️ Zastavit</button>
      </div>
      <textarea
        rows={15}
        value={text}
        readOnly
        style={{ marginTop: 20, width: '100%', fontSize: 14 }}
      />
    </div>
  );
}

export default App;
