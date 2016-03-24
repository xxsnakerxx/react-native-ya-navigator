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
            marginVertical: 11,
            fontWeight: '500',
          },
          leftBtn: {
            color: '#fff',
            marginVertical: 11,
            marginLeft: 10,
          },
          rightBtn: {
            color: '#fff',
            marginVertical: 13,
            marginRight: 10,
          }
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
      <View style={{flex: 1}}>
        <StatusBar
          barStyle={'light-content'}
          animated={true} />

          <YANavigator.Scene
            delegate={this}
            style={styles.container}>
            <Text style={styles.welcome}>
              React Native is AWESOME!
            </Text>
            <Text
              style={styles.text}
              onPress={() => this.props.navigator.push({
                component: View2,
                props: {
                  leftBtnText: 'Back',
                  rightBtnText: 'Do smth',
                }
              })}>
              {'Push next view'}
            </Text>
          </YANavigator.Scene>
      </View>
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
        .setTitle(`Pressed ${this.state.titlePressCount} time${this.state.titlePressCount > 1 ? 's' : ''}`);
    })
  }

  onNavBarLeftBtnPress() {
    this.props.navigator.pop();
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
              .setRightBtn(
                this.state.fetching ?
                <ActivityIndicatorIOS color={'#fff'}/> :
                {
                  text: this.props.rightBtnText || 'Right btn',
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
        onPress: true,
      }
    },
    getNavBarLeftBtn(props) {
      return {
        text: props.leftBtnText || 'Left btn',
      }
    },
    getNavBarRightBtn(props) {
      return {
        text: props.rightBtnText || 'Right btn',
      }
    },
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
      </YANavigator.Scene>
    )
  }

  static navigationDelegate = {
    id: 'view3',
    navBarIsHidden: true,
    sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
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
