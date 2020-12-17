import React, { useState, useEffect } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
  convertFromRaw,
  convertToRaw} from 'draft-js';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    useParams,
    withRouter,
    Link
  } from "react-router-dom";

import 'draft-js/dist/Draft.css';
import './App.css'

import firebase from 'firebase';

import { IconButton, Grid } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';


const NewPost = () => {
    const {id} = useParams()

    const [titleEditorState, setTitleEditorState] = React.useState(
        () => EditorState.createEmpty()
    );

    const [editorState, setEditorState] = React.useState(
        () => EditorState.createEmpty()
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
        if (e.keyCode === 75 /* `S` key */ && hasCommandModifier(e)) {
            firebase.database().ref("user").child(id).push({
                date: Date.now().toString(),
                title: JSON.stringify(convertToRaw(titleEditorState.getCurrentContent())),
                content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
            })
        }
        return false;
    }

    const submit = () => {
        firebase.database().ref("user").child(id).push({
            date: Date.now().toString(),
            title: JSON.stringify(convertToRaw(titleEditorState.getCurrentContent())),
            content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
          })
       //window.location.href= '/' + id
    }
    
    return <div className='new-post'>
        <Editor
            className='new-post-title'
            editorState={titleEditorState}
            onChange={setTitleEditorState} 
            handleKeyCommand={handleKeyCommand}
            readOnly={false}
            placeholder='Title'
        />
        <br/>
        <Editor
            editorState={editorState}
            onChange={setEditorState} 
            handleKeyCommand={handleKeyCommand}
            readOnly={false}
            placeholder="people don't realize that ravens are actually purple..."
        />
        <Link to={'/' + id} onClick={submit}>
            <Grid container justify = "center">
                <IconButton className='submit-btn' aria-label="submit">
                    <SendIcon/>
                </IconButton>
            </Grid>
        </Link>
    </div>;
}

export default NewPost