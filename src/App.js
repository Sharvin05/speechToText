import React from 'react';
import {BrowserRouter, Switch, Route } from 'react-router-dom';
import Acs from './Acs';
import './custom.css'
import SpeechToText from './SpeechToText';

function App() {
  return (
      <React.Fragment>
        <SpeechToText></SpeechToText>
      </React.Fragment>
  );
}

export default App;
