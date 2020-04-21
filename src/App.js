import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import ImageRecognition from './components/ImageRecognition/ImageRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';
 
const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#000000",
        blur: 5
      },
      color: "#000000"
    }
  }
}

const initialState = {
  input: '',
  imgUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  },
  isMobile: window.innerWidth < 768
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;

    window.addEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.setState({
      isMobile: window.innerWidth < 768
    });
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onPictureSubmit = () => {
    this.setState({ imgUrl: this.state.input })
    fetch(`https://image-recognition-brain-api.herokuapp.com/imageUrl`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch(`https://image-recognition-brain-api.herokuapp.com/image`, {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }))
          })
          .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signin') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  }

  render() {
    const { isSignedIn, box, imgUrl, route, isMobile } = this.state

    return (
      <div className="App">
        {
          !isMobile && (
            <Particles 
              className='particles'
              params={ particlesOptions }
            />
          )
        }
        <Navigation isSignedIn={ isSignedIn } onRouteChange={ this.onRouteChange } />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={ this.state.user.name } entries={ this.state.user.entries } />
              <ImageLinkForm 
                onInputChange={ this.onInputChange } 
                onButtonSubmit={ this.onPictureSubmit }
              />
              <ImageRecognition box={ box } imgUrl={ imgUrl }/>
            </div> 
          : (
              route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={ this.onRouteChange } /> 
              : <Register loadUser={this.loadUser} onRouteChange={ this.onRouteChange } /> 
            )
        }
      </div>
    );
  }
}

export default App;
