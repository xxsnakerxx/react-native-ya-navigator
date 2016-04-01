# React Native Yet Another Navigator

![preview_ios](images/ya_navigator_ios.gif)
![preview_android](images/ya_navigator_android.gif)

## Table of contents
- [Main goals](#main-goals)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Copyright and license](#copyright-and-license)

## Main goals
- scene can handle press events on navigation bar items
- scene can change navigation bar items dynamically
- scene can show/hide navigation bar dynamically
- scene itself defines configuration of navigation bar


## Installation

First of all, this component uses awesome [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons#readme), so you need to install it (it's simple)...

then,

```javascript
npm install react-native-ya-navigator --save
```

## Usage

### YANavigator component

```javascript
import YANavigator from 'react-native-ya-navigator';

class App extends React.Component {
  render() {
   return (
     <YANavigator
       initialRoute={{
         component: MyScene,
       }}
       navBarStyle={{
         backgroundColor: 'green',
       }}
       navBarComponentsDefaultStyles={{
         title: {
           color: '#fff',
           fontWeight: '500',
         },
         leftBtn: {
           color: '#fff',
         },
         rightBtn: {
           color: '#fff',
         }
       }}
     />
   )
  }
}
```

Also you can provide some other props
  - style
  - defaultSceneConfig (default value is __Navigator.SceneConfigs.PushFromRight__ for `iOS`
and __Navigator.SceneConfigs.FadeAndroid__ for `Android`).
  - navBarBackIcon
  - sceneStyle

Also `YANavigator` class has static property `navBarHeight` (you can use it in your styles)

### Navigation bar configuration in a scene

Your scene component should define `static` property `navigationDelegate`

```javascript
class MyScene extends React.Component {
  render() {
    return <View>{this.props.children}</View>
  }

  static navigationDelegate = {
    /**
     * if you want to listen nav bar items press events
     * you must to provide id key
     * @type {Something unique}
     */
    id: 'myScene',
    sceneConfig: myCustomSceneConfig,
    /**
     * false by default
     * @type {bool}
     */
    navBarIsHidden: true|false,
    /**
     * @type {String}
     */
    navBarBackgroundColor: 'red',
    /**
     * @param  {object} props [route props]
     * @return {ReactElement|Object}
     */
    getNavBarTitle(props) {
      return {
        text: 'Title',
        style: {
          color: 'white',
        }
      }
      // or
      return <MyTitleComponent title={'Title'}/>
    },
    /**
     * @param  {object} props [route props]
     * @return {ReactElement|Object}
     */
    getNavBarLeftBtn(props) {
      return {
        text: 'Left btn',
        style: {
          color: 'white',
        }
      }
      // or
      return MyButtonComponent
      // or
      return <MyButtonComponent {...props}/>
    },
    /**
     * @param  {object} props [route props]
     * @return {ReactElement|Object}
     */
    getNavBarRightBtn(props) {
      return {
        text: 'Right btn',
        style: {
          color: 'white',
        }
      }
      // or
      return MyButtonComponent
      // or
      return <MyButtonComponent {...props}/>
    },
    /**
     * will be called first on back android button press
     * @param  {object} navigator [navigator instance]
     */
    onAndroidBackPress(navigator) {
      navigator.popToPop();
    }
  }
}
```

### Listening navigation bar items press events

You should wrap your scene component with `YANavigator.Scene` component and set __this__ to `delegate` prop.
__Don't forget to define `id` in the `navigationDelegate`__

```javascript
class MyScene extends React.Component {
  render() {
    return (
      <YANavigator.Scene
        delegate={this}>
        {this.props.children}
      </YANavigator.Scene>
    )
  }
```

Also `YANavigator.Scene` has `style` prop and `paddingTop` (if it's true(__default value__) then scene will have top padding equals height of the navigation bar, also you can use `YANavigator.navBarHeight` in your styles)

### How to handle navigation bar items press events

```javascript
class MyScene extends React.Component {
  onNavBarTitlePress() {
    // handle title press event here
  }

  onNavBarRightBtnPress() {
    // handle right btn press event here
  }

  onNavBarLeftBtnPress() {
    // handle left btn press event here
  }

  render() {
    return (
      <YANavigator.Scene
        delegate={this}>
        {this.props.children}
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'myScene',
    getNavBarTitle() {
      return {
        text: 'Press me!',
        onPress: true,
      }
    }
  }
```

### How to change navigation bar items dynamically

It's little bit tricky :) YANavigator render custom NavBar component that has some helpful methods
- updateUI
- show('fade'|'slide') __default behavior is `fade`__
- hide('fade'|'slide') __default behavior is `fade`__


```javascript
class MyScene extends React.Component {
  onNavBarTitlePress() {
    this.props.navigator._navBar
    updateUI({
      title: 'New title',
      leftBtn: <MyAwesomeBtn text={'left'}/>,
      rightBtn: <MyAwesomeBtn text={'right'}/>,
    })
  }

  render() {
    return (
      <YANavigator.Scene
        delegate={this}>
        {this.props.children}
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'myScene',
    getNavBarTitle() {
      return {
        text: 'Press me!',
        onPress: true,
      }
    }
  }
```

#### Feel free to go to [example](example) and explore it for more details

## Contributing

Just submit a pull request!

## Copyright and license

Code and documentation copyright 2015 Dmitriy Kolesnikov. Code released under the [MIT license](LICENSE).
