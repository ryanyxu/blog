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

import { IconButton, Grid, Divider} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import NewPost from './NewPost';


const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/:id/new" children={<NewPost/>}/>
        <Route path="/:id" children={<Blog/>} />
      </Switch>
    </Router>
  );
}
const Blog = () => {
  const emptyPost = "{\"blocks\":[{\"key\":\"aoe6u\",\"text\":\"\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}],\"entityMap\":{}}"
  const {id} = useParams()

  return <div>
    <Posts id={id} />
    <Link to={'/' + id + '/new'}>
      <Grid container justify = "center">
        <IconButton aria-label="new post" >
          <AddIcon />
        </IconButton>
      </Grid>
    </Link>
  </div>
}


class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {posts: []}
    firebase.database().ref("user").child(this.props.id).on('child_added', (snapshot) => {
      this.setState({posts: [...this.state.posts, 
        { postId: snapshot.key,
          title: EditorState.createWithContent(convertFromRaw(JSON.parse(snapshot.val().title))),
          content: EditorState.createWithContent(convertFromRaw(JSON.parse(snapshot.val().content)))}]})
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
    return <>
      <h2>{this.props.id}'s journal</h2>
      {this.state.posts.map((post) =>
      <Post
        id={this.props.id}
        post = {post}/>)}
        </>
  }
}


const Post = (props) => {
  const [titleEditorState, setTitleEditorState] = React.useState(
    () => props.post.title
  );

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
      firebase.database().ref("user").child(props.id).child(postId).set({
          date: Date.now().toString(),
          title: JSON.stringify(convertToRaw(titleEditorState.getCurrentContent())),
          content: JSON.stringify(convertToRaw(editorState.getCurrentContent()))
        })
    }
    return getDefaultKeyBinding(e);
  }

  return <>
    <div className='post'>
      <Editor
        editorState={titleEditorState}
        onChange={setTitleEditorState} 
        handleKeyCommand={handleKeyCommand}
        readOnly={true}
        placeholder='Title'
      />
      <Editor
        editorState={editorState}
        onChange={setEditorState} 
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={keyBinding}
        readOnly={true}
        placeholder="people don't realize that ravens are actually purple..."
      />
    </div>
    <Divider variant='middle' />
  </>
}

export default App