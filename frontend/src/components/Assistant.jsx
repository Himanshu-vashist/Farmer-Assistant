import { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import { FaMicrophone, FaSync, FaBolt } from "react-icons/fa"; // Importing icons
import "./Assistant.css";

const Assistant = () => {
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    const [response, setResponse] = useState("");
    const [inputText, setInputText] = useState(""); // State for manual text input
    const [history, setHistory] = useState([]);
    const formatResponse = (text) => {
        let formatted = text.replace(/(\d+\.\s)/g, "\n\n$1");
        formatted = formatted.replace(/:\s/g, ":\n");
        formatted = formatted.replace(/-\n/g, "-");
        formatted = formatted.replace(/\(\s*(\d+)\.\s*(\d+)-\s*(\d+)\.\s*(\d+)\)/g, "($1.$2-$3.$4)");
        formatted = formatted.replace(/\n{3,}/g, "\n\n");
        formatted = formatted.replace(/\n(?=\d)/g, " ");
        return formatted.trim();
    };

    const handleGenerateResponse = async () => {
        const userInput = transcript || inputText; // Use either speech or text input
        if (!userInput) {
            alert("Please speak or enter some text first.");
            return;
        }
        try {
            const res = await axios.post("http://127.0.0.1:8000/get-response", { text: userInput });
            //setResponse(formatResponse(res.data.response));
            const formatedResponse = formatResponse(res.data.response);
            setResponse(formatedResponse);
            setHistory((prevHistory) => [...prevHistory, { question: userInput, answer: formatedResponse }]);
        } catch (error) {
            console.error("Error generating response:", error);
            alert("AI response generation failed.");
        }
    };

    return (
        <div className="app-container">
            <div className="history-container">
                <h2>History</h2>
                <ul className="history-list">
                    {history.map((item, index) => (
                        <li key={index} onClick={() => setResponse(item.answer)}>
                            <span className="history-question">{item.question}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="assistant-container">
                <h2>AgriAI</h2>

                <div className="response-container">
                    <div className="formatted-response">
                        {response ? (
                            response.split("\n").map((line, i) => <p key={i} className="response-line">{line}</p>)
                        ) : (
                            <p className="placeholder">AI response will appear here...</p>
                        )}
                    </div>
                </div>

                <div className="input-section">
                    <textarea
                        value={transcript || inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type or speak here..."
                        rows="4"
                    ></textarea>

                    <div className="button-group">
                        <button onClick={SpeechRecognition.startListening} className={`listen-btn ${listening ? "active" : ""}`}>
                            <FaMicrophone /> {listening ? "Listening..." : "Speak"}
                        </button>
                        <button className="reset-btn" onClick={() => { resetTranscript(); setInputText(""); }}>
                            <FaSync /> Reset
                        </button>
                        <button className="generate-btn" onClick={handleGenerateResponse}>
                            <FaBolt /> Get Response
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assistant;