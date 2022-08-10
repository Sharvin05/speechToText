import react from "react";
import { Container } from "reactstrap";
import { getTokenOrRefresh } from "./token_util";
import "./custom.css";
import { useState, useEffect } from "react";
const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
function SpeechToText() {
    const [displayText, setDisplayText] = useState();
    const [audioConfig, setAudioConfig] = useState();
    const [speechConfig, setSpeechConfig] = useState();
    const [recognizer, setRecognizer] = useState();
    const [isMicOn, setIsMicOn] = useState(false);
    useEffect(() => {
        console.log("audio speech config - ", audioConfig, speechConfig, isMicOn);
        console.log("recognizer - ", recognizer);
        if (!audioConfig || !speechConfig || !isMicOn || recognizer) return;
        console.log("set mic recognizer");
        let recognizerTemp = new speechsdk.SpeechRecognizer(
            speechConfig,
            audioConfig
        );
        recognizerTemp.startContinuousRecognitionAsync();
        console.log("starting mic recognition");
        recognizerTemp.recognizing = (s, e) => {
            setDisplayText(`RECOGNIZING: Text=${e.result.text}`);
            console.log(e);
        };
        recognizerTemp.recognized = (s, e) => {
            if (e.result.reason == speechsdk.ResultReason.RecognizedSpeech) {
                setDisplayText(`RECOGNIZED: Text=${e.result.text}`);
            } else if (e.result.reason == speechsdk.ResultReason.NoMatch) {
                setDisplayText(`Speech coud not be recognized`);
            }
        };
        recognizerTemp.canceled = (s, e) => {
            console.log(`CANCELED: Reason=${e.reason}`);
            if (e.reason == speechsdk.CancellationReason.Error) {
                recognizerTemp.stopContinuousRecognitionAsync();
                console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
                console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
                console.log(
                    "CANCELED: Did you set the speech resource key and region values?"
                );
            }
        };
        recognizerTemp.sessionStopped = (s, e) => {
            console.log("\n    Session stopped event.");
            recognizerTemp.stopContinuousRecognitionAsync();
        };
        setRecognizer(recognizerTemp);
    }, [audioConfig, speechConfig, isMicOn]);
    useEffect(() => {
        console.log("useeffect for isMicOn - ", isMicOn, recognizer);
        if (!recognizer) return;
        if (isMicOn) {
            recognizer.startContinuousRecognitionAsync();
            console.log("start mic recognition");
        } else {
            recognizer.stopContinuousRecognitionAsync();
        }
    }, [isMicOn]);
    async function sttFromMic() {
        console.log("start mic");
        setIsMicOn(true);
        const tokenObj = await getTokenOrRefresh();
        setAudioConfig(speechsdk.AudioConfig.fromDefaultMicrophoneInput());
        setSpeechConfig(
            speechsdk.SpeechConfig.fromAuthorizationToken(
                tokenObj.authToken,
                tokenObj.region
            )
        );
        // await setRecognizer(new speechsdk.SpeechRecognizer(speechConfig,audioConfig))
    }
    return (
        <Container className="app-container">
            <h1 className="display-4 mb-3">Speech sample app</h1>
            <div className="row main-container">
                <div className="col-6">
                    <button
                        className="btn btn-primary"
                        onMouseDown={() => sttFromMic()}
                        onTouchStart={() => sttFromMic()}
                        onMouseUp={() => setIsMicOn(false)}
                        onMouseLeave={() => setIsMicOn(false)}
                        onTouchEnd={() => setIsMicOn(false)}
                    
                    >
                        start/stop
                    </button>
                </div>
                <div className="col-6 output-display rounded">
                    <code>{displayText}</code>
                </div>
            </div>
        </Container>
    );
}
export default SpeechToText;