import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
  convertFromRaw,
  convertToRaw,
  Modifier,
} from "draft-js";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  withRouter,
  Link,
} from "react-router-dom";

import "draft-js/dist/Draft.css";
import "./App.css";

import firebase from "firebase";

import {
  IconButton,
  Grid,
  Divider,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

const App = () => (
  <Router>
    <Switch>
      <Route path="/:page" children={<Notepad />} />
      <Route path="/" children={<Home />} />
    </Switch>
  </Router>
);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pages: [] };
    firebase
      .database()
      .ref("page")
      .orderByChild('created')
      .on("child_added", (snapshot) => {
        this.setState({ pages: [...this.state.pages, snapshot.key] });
      });
  }

  render() {
    return (
      <Grid
        className="home"
        container
        direction="row"
        justify="center"
        alignItems="center"
      >
        <div
          style={{ marginRight: "10vmin", marginBottom: "3vmin", fontSize: 60 }}
        >
          Ryan's notes
        </div>

        <Divider orientation="vertical" flexItem />
        <Box
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            width: "auto",
            fontSize: 30,
          }}
        >
          {this.state.pages.reverse().map((page) => (
            <ListItem button component="a" href={"/" + page}>
              {page}
            </ListItem>
          ))}
        </Box>
      </Grid>
    );
  }
}

const Notepad = () => {
  const { page } = useParams();

  const getEmpty = () => {
    let key = page + "T";
    var test =
      '{"blocks":[{"key":"' +
      key +
      '","text":"' +
      page +
      '","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}';
    return EditorState.createWithContent(convertFromRaw(JSON.parse(test)));
  };

  const [titleEditorState, setTitleEditorState] = React.useState(() =>
    getEmpty()
  );

  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  const [createdState, setCreatedState] = React.useState(() => '');
  const [newState, setNewState] = React.useState(false)

  useEffect(() => {
    firebase
      .database()
      .ref("page")
      .child(page)
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          let title = EditorState.createWithContent(
            convertFromRaw(JSON.parse(snapshot.val().title))
          );
          let editor = EditorState.createWithContent(
            convertFromRaw(JSON.parse(snapshot.val().content))
          );
          setTitleEditorState(title);
          setEditorState(editor);
          setCreatedState(snapshot.val().created)
        } else {
          setCreatedState(Date.now().toString())
          setNewState(true)
        }
      });
  }, []);

  const save = () => {
    if (newState) {
      firebase.database().ref("page").child(page).set({
        created: createdState,
        edited: Date.now().toString(),
        title: JSON.stringify(
          convertToRaw(titleEditorState.getCurrentContent())
        ),
        content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      });
    } else {
      firebase.database().ref("page").child(page).update({
        edited: Date.now().toString(),
        title: JSON.stringify(
          convertToRaw(titleEditorState.getCurrentContent())
        ),
        content: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      });
    }
    
  };

  const onTab = (e) => {
    e.preventDefault();
    let currentState = editorState;

    const selection = currentState.getSelection();
    const blockType = currentState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    if (
      blockType === "unordered-list-item" ||
      blockType === "ordered-list-item"
    ) {
      setEditorState(RichUtils.onTab(e, currentState, 3));
    } else {
      let newContentState = Modifier.replaceText(
        currentState.getCurrentContent(),
        currentState.getSelection(),
        "        "
      );

      setEditorState(
        EditorState.push(currentState, newContentState, "insert-characters")
      );
    }
  };

  const handleKeyCommand = (command, editorState, b) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);


    if (newState) {
      if (b) {
        setTitleEditorState(newState);
      } else {
        setEditorState(newState);
      }
      return "handled";
    }

    return "not-handled";
  };
  

  const { hasCommandModifier } = KeyBindingUtil;

  const keyBinding = (e) => {
    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
      e.preventDefault();
      save();
      return 'save'
    }
    /*
    console.log(e.keyCode)
    if (e.keyCode === 32) {
      var selectionState = editorState.getSelection();
      var anchorKey = selectionState.getAnchorKey();
      var currentContent = editorState.getCurrentContent();
      var currentContentBlock = currentContent.getBlockForKey(anchorKey);
      var text = currentContentBlock.getText()
      if (text.length === 1 && text[0] === '-') {
        console.log('i am here')
        var newState = RichUtils.toggleBlockType(
          editorState,
          'unordered-list-item'
        )
        setEditorState(newState)
        return 'list'
      }
    }
    */

    return getDefaultKeyBinding(e);
  };

  return (
    <div style={{margin: "20vmin 30vmin"}}>
      <div style={{fontSize:25}}>{(new Date(createdState)).toLocaleDateString()}</div>
      <div style={{marginTop: '1vmin',marginBottom: '5vmin', fontSize:45}}>
        <Editor
          editorState={titleEditorState}
          onChange={setTitleEditorState}
          handleKeyCommand={(c, e) => handleKeyCommand(c, e, true)}
          keyBindingFn={keyBinding}
          readOnly={false}
          placeholder="title"
        />
      </div>

      <Divider variant="middle" />

      <div style={{marginTop: '5vmin', fontSize:30}}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={(c, e) => handleKeyCommand(c, e, false)}
          keyBindingFn={keyBinding}
          readOnly={false}
          placeholder="my thoughts..."
          onTab={onTab}
        />
      </div>
    </div>
  );
};

export default App;
