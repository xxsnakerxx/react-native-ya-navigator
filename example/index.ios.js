/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import YANavigator from 'react-native-ya-navigator';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Navigator,
  ActivityIndicatorIOS,
  ScrollView,
} from 'react-native';

class YANavigatorExample extends Component {
  render() {
    return (
      <YANavigator
        initialRoute={{
          component: View1,
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
          },
        }}
      />
    );
  }
}

class View1 extends Component {
  onNavBarLeftBtnPress() {
    alert('left btn press');
  }

  onNavBarRightBtnPress() {
    alert('right btn press');
  }

  render() {
    return (
      <YANavigator.Scene
        delegate={this}
        style={styles.container}>
        <StatusBar
          barStyle={'light-content'}
          animated={true} />
        <Text style={styles.welcome}>
          {'React Native is AWESOME!'}
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
    getNavBarTitle() {
      return {
        text: 'Title',
      }
    },
    getNavBarLeftBtn() {
      return {
        text: 'Left btn',
      }
    },
    getNavBarRightBtn() {
      return {
        text: 'Right btn',
      }
    },
  }
}

class View2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      titlePressCount: 0,
      fetching: false,
    }
  }

  onNavBarTitlePress() {
    this.setState({
      titlePressCount: ++this.state.titlePressCount,
    }, () => {
      this.props.navigator._navBar
        .updateUI({
          title: `Pressed ${this.state.titlePressCount} time${this.state.titlePressCount > 1 ? 's' : ''}`,
        })
    })
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
              this.props.navigator._navBar
              .updateUI({
                rightBtn: this.state.fetching ?
                  <ActivityIndicatorIOS color={'#fff'}/> :
                  {
                    text: this.props.rightBtnText || 'Right btn',
                  },
                title: this.state.fetching ?
                  'Fetching...' :
                  this.state.titlePressCount ? `Pressed ${this.state.titlePressCount} time${this.state.titlePressCount > 1 ? 's' : ''}` : 'Press me!!!',
              })
            })
        }}>
          {`${this.state.fetching ? 'Stop' : 'Start'} fake fetching something`}
        </Text>
        <Text
          style={styles.text}
          onPress={() => this.props.navigator.push({
          component: View3,
        })}>
          {'Push view without NavBar'}
        </Text>
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view2',
    getNavBarTitle() {
      return {
        text: 'Press me!!!',
        touchable: true,
      }
    },
    getNavBarRightBtn(props) {
      return {
        text: props.rightBtnText || 'Right btn',
      }
    },
    navBarBackgroundColor: '#000',
  }
}

class View3 extends Component {
  render() {
    return (
      <YANavigator.Scene
        paddingTop={false}
        delegate={this}
        style={styles.container}>
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
    backBtnText: 'Hey!!!',
    sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
  }
}

class View4 extends Component {
  render() {
    return (
      <YANavigator.Scene
        delegate={this}
        style={styles.container}>
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
    getNavBarTitle() {
      return {
        text: 'Yo ho ho',
      }
    },
    getNavBarRightBtn() {
      return {
        text: 'YAY',
      }
    },
  }
}

class View5 extends Component {
  onNavBarRightBtnPress() {
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
        <StatusBar animated={true} barStyle={'default'}/>
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
    navBarBackgroundColor: 'rgba(0, 0, 0, 0.5)',
    getNavBarLeftBtn() {
      return <ActivityIndicatorIOS color={'#000'} />
    },
    getNavBarTitle() {
      return {
        text: 'The looooongest title',
        style: {
          color: '#000',
        },
      }
    },
    getNavBarRightBtn() {
      return {
        text: 'Reset',
        style: {
          color: '#000',
        },
      }
    },
  }
}

AppRegistry.registerComponent('YANavigatorExample', () => YANavigatorExample);

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
