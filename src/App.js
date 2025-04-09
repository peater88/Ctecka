import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

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
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const speak = () => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "cs-CZ";
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
    speechRef.current = utterance;
    setIsSpeaking(true);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Čtečka PDF s hlasem</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {text && (
        <div style={{ marginTop: '20px', height: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap' }}>
          {text}
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <button onClick={speak} disabled={isSpeaking || !text}>Spustit čtení</button>
        <button onClick={stop} disabled={!isSpeaking} style={{ marginLeft: '10px' }}>Zastavit</button>
      </div>
    </div>
  );
}

export default App;
