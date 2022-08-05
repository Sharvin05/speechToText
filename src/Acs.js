import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
import './custom.css'

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayText: 'INITIALIZED: ready to test speech...',
            cancel:0,
            audioConfig:null,
            tokenObj:null,
            speechConfig:null,
            recognizer:null
        }

    }
 
    async componentDidMount() {
        // check for valid speech key/region
        const tokenRes = await getTokenOrRefresh();
        
        if (tokenRes.authToken === null) {
            this.setState({
                displayText: 'FATAL_ERROR: ' + tokenRes.error,                
            });
        }
        
    }
    async sttFromMic() {   
        const tokenObj = await getTokenOrRefresh();     
        this.setState({
            audioConfig:speechsdk.AudioConfig.fromDefaultMicrophoneInput(),
            speechConfig:speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region)
            
            
        })
        this.setState({
            recognizer:new speechsdk.SpeechRecognizer(this.state.speechConfig, this.state.audioConfig)
        })
        this.state.recognizer.startContinuousRecognitionAsync();
        // recognizer.startContinuousRecognitionAsync();

        this.state.recognizer.recognizing = (s, e) => {
            this.setState({
                displayText: `RECOGNIZING: Text=${e.result.text}`
            });
            
        };

        this.state.recognizer.recognized = (s, e) => {
            if (e.result.reason == speechsdk.ResultReason.RecognizedSpeech) {
                this.setState({
                        displayText:`RECOGNIZED: Text=${e.result.text}`,
                        cancel:1
                })
                
            }
            else if (e.result.reason == speechsdk.ResultReason.NoMatch) {
                this.setState({
                    displayText:`Speech coud not be recognized`
            })
            }
        };
        
        
        this.state.recognizer.canceled = (s, e) => {
            console.log(`CANCELED: Reason=${e.reason}`);

            if (e.reason == speechsdk.CancellationReason.Error) {
                this.state.recognizer.stopContinuousRecognitionAsync();
                console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
                console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
                console.log("CANCELED: Did you set the speech resource key and region values?");
            }
        };

        this.state.recognizer.sessionStopped = (s, e) => {            
            console.log("\n    Session stopped event.");
            this.state.recognizer.stopContinuousRecognitionAsync();
            this.setState({
                cancel:0
            }) 
        };
    }
    // async sttFromMic() {
    //     const tokenObj = await getTokenOrRefresh();
    //     const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    //     speechConfig.speechRecognitionLanguage = 'en-US';

    //     const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    //     const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    //     this.setState({
    //         displayText: 'speak into your microphone...'
    //     });
    //     recognizer.recognizeOnceAsync(result => {
    //         let displayText;
    //         if (result.reason == ResultReason.RecognizedSpeech) {
    //             displayText = `RECOGNIZED: Text=${result.text}`
    //         } else {
    //             displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
    //         }

    //         this.setState({
    //             displayText: displayText
    //         });
    //     });
    // }

    render() {
        return (
            <Container className="app-container">
                <h1 className="display-4 mb-3">Speech sample app</h1>

                <div className="row main-container">
                    <div className="col-6">
                        <button style={{"margin-right":"20px"}} className="btn btn-primary" onClick={() => this.sttFromMic()}>start</button>
                        <button className="btn btn-primary" onClick={() => this.state.recognizer.stopContinuousRecognitionAsync()}>stop</button>
                    </div>
                    <div className="col-6 output-display rounded">
                        <code>{this.state.displayText}</code>
                    </div>
                </div>
            </Container>
        );
    }
}