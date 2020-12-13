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
    withRouter
  } from "react-router-dom";

import 'draft-js/dist/Draft.css';
import './App.css'

import firebase from 'firebase';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/:id" children={<Blog/>} />
      </Switch>
    </Router>
  );
}

class Blog extends React.Component {
  constructor(props) {
    super(props);
    //this.addItem = this.addItem.bind(this);
    //const {id}= useParams()
    var id = 'ryan'
    this.state = {posts: [], id: id}
    firebase.database().ref("user").child(id).on('child_added', (snapshot) => {
      this.setState({posts: [...this.state.posts, {postId: snapshot.key, content: EditorState.createWithContent(convertFromRaw(JSON.parse(snapshot.val().content)))}]})
    })
    /* not needed yet
    database.ref('items').on('child_removed', (data) => {
      console.log('removed')
      for (var i = 0; i < this.state.blogs.length; i++) {
        if (this.state.blogs[i].key == data.key) {
          this.state.blogs.splice(i, 1)
        }
      }
      this.setState({})
    })
    */
  }
  /*
  addPost(e) {
    if (e.key === "Enter") {
      addItem(e.target.value);
      e.target.value = "";
    }
  }

  deleteItem(itemKey) {
    removeItem(itemKey);
  }
  */


  render() {
    return <>{this.state.posts.map((post) => <Post id={this.state.id} post = {post}/>)}</>
  }
}


const Post = (props) => {
  const [editorState, setEditorState] = React.useState(
    () => props.post.content
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
      var postId = props.post.postId
      firebase.database().ref("user").child(props.id).set({[postId]: {
          date: Date.now().toString(),
          content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
        }})
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