import React from 'react';
import ReactDOM from 'react-dom';
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil} from 'draft-js';

import 'draft-js/dist/Draft.css';
import './App.css'

import firebase from 'firebase';



function App() {
  var database = firebase.database();

  const [editorState, setEditorState] = React.useState(
    () => EditorState.createEmpty(),
  );

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  }

  const {hasCommandModifier} = KeyBindingUtil

  const keyBinding = (e) => {
    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
      console.log('saved');
      database.ref("user").child('ryan').push('hi');
    }
    return getDefaultKeyBinding(e);
  }



  return <Editor
    editorState={editorState}
    onChange={setEditorState} 
    handleKeyCommand={handleKeyCommand}
    keyBindingFn={keyBinding}
  />;
}

export default App