import YANavigator from 'react-native-ya-navigator';

import React, { PropTypes } from 'react';

import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';

import { Navigator } from 'react-native-deprecated-custom-components';

export default class YANavigatorExample extends React.Component {
  render() {
    return (
      <YANavigator
        initialRoute={{
          component: View1,
        }}
        navBarStyle={{
          backgroundColor: 'green',
        }}
        navBarBackBtn={{
          textStyle: {
            color: '#fff',
          },
        }}
      />
    );
  }
}

class View1NavBarLeftBtn extends React.Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}>
        <Text
          numberOfLines={1}
          allowFontScaling={false}
          style={{color: '#fff', fontSize: 16}}>
          {'Left btn'}
        </Text>
      </TouchableOpacity>
    )
  }

  static propTypes = {
    onPress: PropTypes.func,
  }
}

class View1 extends React.Component {
  onNavBarLeftPartPress() {
    alert('Left side - btn press');
  }

  onFirstBtnPress() {
    alert('Right side - first btn press');
  }

  onSecondBtnPress() {
    alert('Right side - second btn press');
  }

  render() {
    return (
      <YANavigator.Scene
        delegate={this}
        style={styles.container}>
        <StatusBar
          barStyle={'light-content'}
          animated={true}
          backgroundColor={'green'}/>
        <Image
          source={{uri: 'https://developer-tech.com/media/img/news/reactive-nativingitup.png.800x600_q96.png'}}
          resizeMode={'contain'}
          style={{height: 150, width: 300}}/>
        <Text style={styles.welcome}>
          {'IS AWESOME!!!'}
        </Text>
        <Text
          style={styles.text}
          onPress={() => this.props.navigator.push({
            component: View2,
            props: {
              leftBtnText: 'Back',
              rightBtnText: 'Do smth',
            },
          })}>
          {'Push next view'}
        </Text>
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view1',
    renderTitle() {
      return (
        <View>
          <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>
            {'Title'}
          </Text>
        </View>
      )
    },
    renderNavBarLeftPart() {
      return View1NavBarLeftBtn;
    },
    renderNavBarRightPart() {
      return (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => 'onFirstBtnPress'}>
            <Text style={{fontSize: 16, paddingLeft: 20, color: '#fff'}}>{'1'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 'onSecondBtnPress'}>
            <Text style={{fontSize: 16, paddingLeft: 20, color: '#fff'}}>{'2'}</Text>
          </TouchableOpacity>
        </View>
      )
    },
    backBtnText: 'Title',
  }
}

class View2NavBarTitle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: props.text,
    }
  }

  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Text style={{fontSize: 18, color: '#fff'}}>{this.state.text}</Text>
      </TouchableOpacity>
    )
  }

  static propTypes = {
    text: PropTypes.string,
    onPress: PropTypes.func,
  }

  static defaultProps = {
    text: 'Press me!',
  }
}

class View2NavBarRightBtn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: props.fetching,
    }
  }

  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        {this.state.fetching ?
          <ActivityIndicator color={'#fff'}/> :
          <Text style={{fontSize: 16, color: '#fff'}}>{this.props.text}</Text>
        }
      </TouchableOpacity>
    )
  }

  static propTypes = {
    fetching: PropTypes.bool,
    text: PropTypes.string,
    onPress: PropTypes.func,
  }

  static defaultProps = {
    fetching: false,
  }
}

class View2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      titlePressCount: 0,
      fetching: false,
    }
  }

  onNavBarTitlePress() {
    if (!this.state.fetching) {
      this.setState({
        titlePressCount: ++this.state.titlePressCount,
      }, () => {
        this.props.navigator._navBar.refs.view2_title.setState({
          text: `Pressed ${this.state.titlePressCount} time${this.state.titlePressCount > 1 ? 's' : ''}`,
        })
      })
    }
  }

  onNavBarRightBtnPress() {
    alert(this.state.fetching ?
      'Fetching...' :
      'Right btn press handled from scene component!!!');
  }

  render() {
    return (
      <YANavigator.Scene
        delegate={this}
        style={styles.container}>
        <StatusBar
          animated={true}
          barStyle={'light-content'}
          backgroundColor={'black'}/>
        <Text style={styles.welcome}>
          {'View 2'}
        </Text>
        {this.state.titlePressCount > 0 ?
          <Text style={styles.welcome}>
            {`(Handled press on title ${this.state.titlePressCount} time${this.state.titlePressCount > 1 ? 's' : ''})`}
          </Text> :
          null
        }
        <Text
          style={styles.text}
          onPress={() => {
            this.setState({
              fetching: !this.state.fetching,
            }, () => {
              this.props.navigator._navBar.refs.view2_rightPart
              .setState({
                fetching: this.state.fetching,
              })

              this.props.navigator._navBar.refs.view2_title
              .setState({
                text: this.state.fetching ?
                  'Fetching...' :
                  this.state.titlePressCount ? `Pressed ${this.state.titlePressCount} time${this.state.titlePressCount > 1 ? 's' : ''}` : 'Press me!',
              })
            })
        }}>
          {`${this.state.fetching ? 'Stop' : 'Start'} fake fetching something`}
        </Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator._navBar.updateUI({
              title: <View2NavBarTitle
                text={this.props.navigator._navBar.refs.view2_title.state.text}
                onPress={() => 'onNavBarTitlePress'}
                />,
            });

            this.props.navigator.push({
              component: View3,
            });
          }}
        >
          {'Push view without NavBar'}
        </Text>
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view2',
    renderTitle() {
      return View2NavBarTitle;
    },
    renderNavBarRightPart(props) {
      return (
        <View2NavBarRightBtn
          text={props.rightBtnText}
          onPress={() => 'onNavBarRightBtnPress'}/>
      )
    },
    navBarBackgroundColor: '#000',
  }
}

class View3 extends React.Component {
  render() {
    return (
      <YANavigator.Scene
        paddingTop={false}
        delegate={this}
        style={styles.container}>
        <StatusBar
          animated={true}
          barStyle={'default'}
          backgroundColor={'black'}/>
        <Text style={styles.welcome}>{'View 3'}</Text>
        <Text
          style={styles.text}
          onPress={() => this.props.navigator.pop()}>{'Get back'}</Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator.push({
              component: View4,
            })
          }}>
          {'Push next view'}
        </Text>
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view3',
    navBarIsHidden: true,
    backBtnText: 'Back!',
    sceneConfig: Platform.OS === 'ios' && Navigator.SceneConfigs.FloatFromBottom,
  }
}

class View4NavBarLogo extends React.Component {
  constructor() {
    super();

    this.state = {
      angle: new Animated.Value(0),
    }
  }

  animate() {
    Animated.timing(this.state.angle, {
      toValue: this.state.angle.__getValue() ? 0 : 720,
      duration: 2000,
    }).start();
  }

  render() {
    return (
      <Animated.Image
        source={{uri: 'https://ih1.redbubble.net/image.32576156.9850/sticker,375x360.png'}}
        resizeMode={'contain'}
        style={{
          height: 40,
          width: 40,
          transform: [
            {rotate: this.state.angle.interpolate({
              inputRange: [0, 720],
              outputRange: ['0deg', '720deg'],
            })},
          ],
        }} />
    )
  }
}

class View4 extends React.Component {
  render() {
    return (
      <YANavigator.Scene
        delegate={this}
        style={styles.container}>
        <StatusBar
          animated={true}
          barStyle={'light-content'}
          backgroundColor={'red'}/>
        <Text style={styles.welcome}>{'View 4'}</Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator.push({
              component: View5,
            })
          }}>
          {'Push next view'}
        </Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator._navBar.refs.view4_title.animate();
          }}>
          {'Animate logo'}
        </Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator._navBar.hide();
          }}>
          {'Hide nav bar'}
        </Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator._navBar.show();
          }}>
          {'Show nav bar'}
        </Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator._navBar.hide('slide');
          }}>
          {'Hide nav bar - slide'}
        </Text>
        <Text
          style={styles.text}
          onPress={() => {
            this.props.navigator._navBar.show('slide');
          }}>
          {'Show nav bar - slide'}
        </Text>
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view4',
    navBarBackgroundColor: 'red',
    renderTitle() {
      return View4NavBarLogo
    },
    renderNavBarRightPart() {
      return (
        <View style={{
          backgroundColor: '#fff',
          width: 100,
          alignItems: 'center',
        }}>
          <Text style={{color: '#000', fontSize: 16}}>
            {'Absolutely Any VIEW'}
          </Text>
        </View>
      )
    },
  }
}

class View5 extends React.Component {
  onResetBtnPress() {
    this.props.navigator.immediatelyResetRouteStack([
      {
        component: View1,
      },
    ])
  }

  render() {
    return (
      <YANavigator.Scene
        paddingTop={false}
        delegate={this}
        style={[styles.container, {backgroundColor: 'yellow'}]}>
        <StatusBar
          animated={true}
          barStyle={'default'}
          backgroundColor={'rgba(0, 0, 0, 0.2)'}/>
        <ScrollView
          style={{
            paddingTop: YANavigator.Scene.navBarHeight * 2,
          }}>
          <View style={styles.container}>
            <Text style={[styles.welcome, {color: 'red'}]}>{'Scroll me!'}</Text>
            <Text
              style={[styles.text, {color: 'red'}]}
              onPress={() => {
                this.props.navigator.popToTop()
              }}>
              {'Go to first view'}
            </Text>
          </View>
        </ScrollView>
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view5',
    navBarBackgroundColor: 'rgba(0, 0, 0, 0.2)',
    renderNavBarLeftPart() {
      return (<ActivityIndicator color={'#000'} />)
    },
    renderTitle() {
      return (
        <View>
          <Text style={{color: '#000', fontSize: 16, fontWeight: '600'}}>
            {'Underlay support'}
          </Text>
        </View>
      )
    },
    renderNavBarRightPart() {
      return (
        <TouchableOpacity onPress={() => 'onResetBtnPress'}>
          <Text style={{fontSize: 16, paddingLeft: 20, color: '#000'}}>{'Reset stack'}</Text>
        </TouchableOpacity>
      )
    },
    onAndroidBackPress(navigator) {
      navigator.popToTop();
    },
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    margin: 10,
  },
  text: {
    fontSize: 17,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 15,
  },
});
