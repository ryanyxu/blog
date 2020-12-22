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
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";
import CloudQueueRoundedIcon from '@material-ui/icons/CloudQueueRounded';
import CloudDoneRoundedIcon from '@material-ui/icons/CloudDoneRounded';

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
      .orderByChild("created")
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
          {this.state.pages.map((page) => (
            <ListItem button component="a" href={"/" + page}>
              {page}
            </ListItem>
          )).reverse()}
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

  const [createdState, setCreatedState] = React.useState(() => "");
  const [newState, setNewState] = React.useState(false);
  const [saved, setSaved] = React.useState(false)

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
          setCreatedState(snapshot.val().created);
        } else {
          setCreatedState(Date.now().toString());
          setNewState(true);
        }
      });
      const interval = setInterval(() => {
        save()
      }, 60000 );
    
      return () => clearInterval(interval); 
  }, []);

  const save = () => {
    if (newState) {
      firebase
        .database()
        .ref("page")
        .child(page)
        .set({
          created: createdState,
          edited: Date.now().toString(),
          title: JSON.stringify(
            convertToRaw(titleEditorState.getCurrentContent())
          ),
          content: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
        });
    } else {
      firebase
        .database()
        .ref("page")
        .child(page)
        .update({
          edited: Date.now().toString(),
          title: JSON.stringify(
            convertToRaw(titleEditorState.getCurrentContent())
          ),
          content: JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          ),
        });
    }
    setSaved(true)
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
    setSaved(false)
    if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
      e.preventDefault();
      save();
      return "save";
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
  }
  return (
    <div>
      <Grid
      style={{background: 'transparent', height:'0vh'}}
      container
      direction="row"
      justify="space-between"
      alignItems="flex-start"
    >
        <IconButton
            aria-label="home"
            href="/"
            style={{ margin: "4vmin 0 0 4vmin" }}
          >
            <ArrowBackRoundedIcon fontSize="large" />
          </IconButton>
          <IconButton
            aria-label="home"
            href="/"
            style={{ margin: "4vmin 4vmin 0 0" }}
          >
          {saved ? 
            <CloudDoneRoundedIcon fontSize="large" /> : <CloudQueueRoundedIcon fontSize="large" />}
          </IconButton>
        </Grid>
      <Box
        style={{
          padding: '20vmin 30vmin',//"12vmin 30vmin",
          maxHeight: '60vh',
          overflow: 'auto',
        }}
      >
        <div
          style={{ marginTop: "1vmin", marginBottom: "5vmin", fontSize: 45 }}
        >
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

        <div style={{ marginTop: "5vmin", fontSize: 30 }}>
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
      </Box>
    </div>
  );

  /*

  <div style={{ fontSize: 25 }}>
    {new Date(createdState).toLocaleDateString()}
  </div>
  */
  /*
  return (
    <div>
      <div style={{ maxHeight: "10vh" }}>
        <IconButton
          aria-label="home"
          href="/"
          style={{ margin: "4vmin 0 0 4vmin" }}
        >
          <ArrowBackRoundedIcon fontSize="large" />
        </IconButton>
      </div>
      <Box
        style={{
          margin: "12vmin 30vmin",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{ marginTop: "1vmin", marginBottom: "5vmin", fontSize: 45 }}
        >
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

        <div style={{ marginTop: "5vmin", fontSize: 30 }}>
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
      </Box>
    </div>
  );
  */
};

export default App;
