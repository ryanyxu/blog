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

import { IconButton, Grid, Divider, Button, Box,List, ListItem, ListItemText} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import NewPost from './NewPost';


const EmptyNotepad = () => {
  return (
    <Router>
      <Switch>
        <Route path="/:page" children={<Notepad/>} />
        <Route path='/' children={<Home/>} />
      </Switch>
    </Router>
  );
}


class Home extends React.Component {
    constructor(props) {
      super(props);
      this.state = {pages: []}
      firebase.database().ref("page").on('child_added', (snapshot) => {
        this.setState({pages: [...this.state.pages, snapshot.key]})
      })
    }
  
    render() {
    return <div className='home'>
        <Grid container direction="row" justify = "center" alignItems = "center">

            <div className='heading'>Ryan's notes</div>

        <Divider orientation="vertical" flexItem/>
        <Box style={{maxHeight: '60vh', overflow: 'auto', width: 'auto', }}>
        {
                this.state.pages.map((page) => 
                    <ListItem button component="a" href={'/' + page}>
                        {page}
                    </ListItem>
                )
            }

        </Box>

        </Grid>
        
        </div>
    }
  }

const Notepad = () => {
    const {page} = useParams()

    const getEmpty = () => {
        let key = page + 'T'
        var test = "{\"blocks\":[{\"key\":\"" + key + "\",\"text\":\"" + page + "\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
        return EditorState.createWithContent(convertFromRaw(JSON.parse(test)))
    }

    const [titleEditorState, setTitleEditorState] = React.useState(
        () => getEmpty())
    
    const [editorState, setEditorState] = React.useState(
        () => EditorState.createEmpty());

    useEffect(() => {
        firebase.database().ref("page").child(page).on('value', (snapshot) => {
            if (snapshot.val()) {
                let title = EditorState.createWithContent(convertFromRaw(JSON.parse(snapshot.val().title)))
                let editor = EditorState.createWithContent(convertFromRaw(JSON.parse(snapshot.val().content)))
                setTitleEditorState(title)
                setEditorState(editor)
            }
        });
    }, [])

    const submit = () => {
        firebase.database().ref("page").child(page).set({
            date: Date.now().toString(),
            title: JSON.stringify(convertToRaw(titleEditorState.getCurrentContent())),
            content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
          })
    }
    

    const handleKeyCommand = (command, editorState, b) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);

        if (newState) {
            if (b) {
                setTitleEditorState(newState);
            } else {
                setEditorState(newState);
            }
            return 'handled';
        }
        
        

        return 'not-handled';
    }

    const {hasCommandModifier} = KeyBindingUtil

    const keyBinding = (e) => {
        console.log(e.keyCode)
        if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
            e.preventDefault()
            submit()
        }
        return getDefaultKeyBinding(e);
    }

    return <div className='empty-notepad'>
        <div  className='empty-notepad-title'>
            <Editor 
                editorState={titleEditorState}
                onChange={setTitleEditorState} 
                handleKeyCommand={(c, e) => handleKeyCommand(c, e, true)}
                keyBindingFn={keyBinding}
                readOnly={false}
                placeholder='title'
            />
        </div>
        
        <Divider variant="middle" />
        <div className='empty-notepad-content'>
            
        <Editor 
            editorState={editorState}
            onChange={setEditorState} 
            handleKeyCommand={(c, e) => handleKeyCommand(c, e, false)}
            keyBindingFn={keyBinding}
            readOnly={false}
            placeholder="my thoughts..."
        />
        </div>
        
    </div>
}

export default EmptyNotepad