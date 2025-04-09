import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
        speakText(fullText);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const speakText = (content) => {
    if (!window.speechSynthesis) return alert("TTS není podporováno.");
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "cs-CZ";
    utterance.rate = 1;
    speechRef.current = utterance;
    setIsSpeaking(true);

    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>📖 Nahraj PDF soubor ke čtení</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {isSpeaking && (
        <button onClick={stopSpeaking} style={{ marginLeft: "1rem" }}>
          🛑 Zastavit čtení
        </button>
      )}
      <pre style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>{text}</pre>
    </div>
  );
}

export default App;
