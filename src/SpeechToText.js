import react from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
import './custom.css'
import { useState,useEffect } from 'react';
const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

function SpeechToText(){
    const[displayText,setDisplayText]=useState();
    const[audioConfig,setAudioConfig]=useState();
    const[speechConfig,setSpeechConfig]=useState();
    const[recognizer,setRecognizer]=useState();
    const [isMicOn, setIsMicOn] = useState(false)

    useEffect(()=>{
         
            const tokenRes= async()=>{
                await getTokenOrRefresh()
                if (tokenRes.authToken === null) {
                    setDisplayText('FATAL_ERROR: ' + tokenRes.error)
                }
            } 
        
       
    },[])
        
    
        // useEffect(()=>{
        //     const tokenObj = async()=>{
        //         await getTokenOrRefresh();
        //         setAudioConfig(speechsdk.AudioConfig.fromDefaultMicrophoneInput())
        //         setSpeechConfig(speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region))
        //     }         
        // })
        useEffect(()=>{
            if(!audioConfig || !speechConfig || !isMicOn) return;
            setRecognizer(new speechsdk.SpeechRecognizer(speechConfig,audioConfig))
        }, [audioConfig, speechConfig, isMicOn]);

        useEffect(()=>{
            if(!isMicOn || !recognizer) return;
            recognizer.startContinuousRecognitionAsync();
        recognizer.recognizing = (s, e) => {
            setDisplayText(`RECOGNIZING: Text=${e.result.text}`) 
        };
        recognizer.recognized = (s, e) => {
            if (e.result.reason == speechsdk.ResultReason.RecognizedSpeech) {
                setDisplayText(`RECOGNIZED: Text=${e.result.text}`)             
            }
            else if (e.result.reason == speechsdk.ResultReason.NoMatch) {
                setDisplayText(`Speech coud not be recognized`)
            }
        };
        recognizer.canceled = (s, e) => {
            console.log(`CANCELED: Reason=${e.reason}`);
            if (e.reason == speechsdk.CancellationReason.Error) {
                recognizer.stopContinuousRecognitionAsync();
                console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
                console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
                console.log("CANCELED: Did you set the speech resource key and region values?");
            }
        };
        recognizer.sessionStopped = (s, e) => {            
            console.log("\n    Session stopped event.");
            recognizer.stopContinuousRecognitionAsync();
        };
        }, [isMicOn, recognizer]);

        useEffect(() => {
            if(!isMicOn && recognizer)  recognizer.stopContinuousRecognitionAsync();
        }, [isMicOn])

    
    async function sttFromMic(){
        setIsMicOn(true);
        const tokenObj=await getTokenOrRefresh();
        setAudioConfig(speechsdk.AudioConfig.fromDefaultMicrophoneInput())
        setSpeechConfig(speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region))
        // await setRecognizer(new speechsdk.SpeechRecognizer(speechConfig,audioConfig))
    }
    
    
    return(
        
            <Container className="app-container">
                <h1 className="display-4 mb-3">Speech sample app</h1>

                <div className="row main-container">
                    <div className="col-6">
                        <button style={{"margin-right":"20px"}} className="btn btn-primary" onClick={() =>sttFromMic()}>start</button>
                        <button className="btn btn-primary" onClick={() =>setIsMicOn(false)}>stop</button>
                    </div>
                    <div className="col-6 output-display rounded">
                        <code>{displayText}</code>
                    </div>
                </div>
            </Container>
       
    )
}
export default SpeechToText;