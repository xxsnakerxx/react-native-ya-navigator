import React from 'react-native';
import omit from 'lodash.omit';

import NavBar from './NavBar';
import NavBarTitle from './NavBarTitle';
import NavBarBtn from './NavBarBtn';

import Scene from './Scene';

import { getNavigationDelegate } from './utils';

import * as constants from './constants';

const {
  View,
  StyleSheet,
  Navigator,
  PropTypes,
  Platform,
  BackAndroid,
} = React;

const validTextStyles =
  Object.keys(require('react-native/Libraries/Text/TextStylePropTypes'));

export default class YANavigator extends React.Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      this._backPressSub = BackAndroid.addEventListener('hardwareBackPress', () => {
        const { navigator } = this.refs;
        const navState = navigator.state;
        const presentedComponent =
          navState.routeStack[navState.presentedIndex].component;
        const navigationDelegate = getNavigationDelegate(presentedComponent)

        if (navigationDelegate && navigationDelegate.onAndroidBackPress) {

          navigationDelegate.onAndroidBackPress(navigator);

          return true;
        } else if (navState.routeStack.length > 1) {
          navigator.pop();

          return true;
        }

       return false;
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this._backPressSub.remove();
    }
  }

  _renderScene = (route, navigator) => {
    let Component;

    if (typeof route.component === 'object') {
      Component = React.cloneElement(route.component, {
        navigator,
        ...route.props,
      });
    } else if (typeof route.component === 'function') {
      Component = (
        <route.component
          navigator={navigator}
          {...route.props}
          />
        )
    }

    return Component;
  };

  _configureScene = (route) => {
    const navigationDelegate = getNavigationDelegate(route.component);

    return (navigationDelegate && navigationDelegate.sceneConfig) ||
            this.props.defaultSceneConfig;
  };

  _renderNavigationBar(
    navBarStyle,
    navBarComponentsDefaultStyles = {},
    isHiddenOnInit,
    navBarBackIcon
  ) {

    const titleStyle = navBarComponentsDefaultStyles.title;
    const leftBtnStyle = navBarComponentsDefaultStyles.leftBtn;
    const rightBtnStyle = navBarComponentsDefaultStyles.rightBtn;

    return (
      <NavBar
        isHiddenOnInit={isHiddenOnInit}
        style={navBarStyle}
        backIcon={navBarBackIcon}
        routeMapper={{
          navBarBackgroundColor: (route) => {
            let navBarBackgroundColor = '';

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.navBarBackgroundColor) {

                navBarBackgroundColor =
                  navigationDelegate.navBarBackgroundColor;
            }

            return navBarBackgroundColor;
          },

          LeftButton: (route, navigator, index, state) => {
            let LeftBtn = null;

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.getNavBarLeftBtn) {

              LeftBtn = navigationDelegate.getNavBarLeftBtn(route.props || {});

              if (!LeftBtn) return null;

              if (typeof LeftBtn === 'object') {
                if (React.isValidElement(LeftBtn)) {
                  const _leftBtnStyle = omit(leftBtnStyle, validTextStyles);

                  LeftBtn = React.createElement(NavBarBtn, {
                    onPress: this._emitNavBarLeftBtnPress.bind(this, route),
                    side: 'left',
                    style: _leftBtnStyle,
                  }, LeftBtn);
                } else {
                  LeftBtn = (
                    <NavBarBtn
                      onPress={this._emitNavBarLeftBtnPress.bind(this, route)}
                      side={'left'}
                      text={LeftBtn.text}
                      textStyle={[leftBtnStyle, LeftBtn.style]}/>
                  )
                }
              } else if (typeof LeftBtn === 'function') {
                const _leftBtnStyle = omit(leftBtnStyle, validTextStyles);

                LeftBtn =
                  (<NavBarBtn
                    onPress={this._emitNavBarLeftBtnPress.bind(this, route)}
                    style={_leftBtnStyle}>
                      <LeftBtn />
                  </NavBarBtn>)
              }
            } else {
              if (index > 0) {
                // tell navBar to render back button
                const prevRoute = state.routeStack[index - 1];
                const previousComponent = prevRoute.component;
                const previousNavigationDelegate = getNavigationDelegate(previousComponent);

                let backBtnText = '';

                if (previousNavigationDelegate) {
                  if (typeof previousNavigationDelegate.backBtnText === 'string') {
                    backBtnText = previousNavigationDelegate.backBtnText;
                  } else if (previousNavigationDelegate.getNavBarTitle) {
                    backBtnText =
                      previousNavigationDelegate.getNavBarTitle(prevRoute.props || {}).text
                  }
                }

                return {
                  isBackBtn: true,
                  text: backBtnText,
                  textStyle: leftBtnStyle,
                }
              }
            }


            return LeftBtn;
          },

          RightButton: (route) => {
            let RightBtn = null;

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.getNavBarRightBtn) {

              RightBtn = navigationDelegate.getNavBarRightBtn(route.props || {});

              if (!RightBtn) return null;

              if (typeof RightBtn === 'object') {
                if (React.isValidElement(RightBtn)) {
                  const _rightBtnStyle = omit(rightBtnStyle, validTextStyles);

                  RightBtn = React.createElement(NavBarBtn, {
                    onPress: this._emitNavBarRightBtnPress.bind(this, route),
                    side: 'right',
                    style: _rightBtnStyle,
                  }, RightBtn);
                } else {
                  RightBtn = (
                    <NavBarBtn
                      onPress={this._emitNavBarRightBtnPress.bind(this, route)}
                      side={'right'}
                      text={RightBtn.text}
                      textStyle={[rightBtnStyle, RightBtn.style]}/>
                  )
                }
              } else if (typeof RightBtn === 'function') {
                const _rightBtnStyle = omit(rightBtnStyle, validTextStyles);

                RightBtn =
                  (<NavBarBtn
                    onPress={this._emitNavBarRightBtnPress.bind(this, route)}
                    style={_rightBtnStyle}>
                    <RightBtn />
                  </NavBarBtn>)
              }
            }

            return RightBtn;
          },

          Title: (route) => {
            let Title = null;

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.getNavBarTitle) {

              Title = navigationDelegate.getNavBarTitle(route.props || {});

              if (!Title) return null;

              if (typeof Title === 'object') {
                if (React.isValidElement(Title)) {
                  Title = React.cloneElement(Title, {
                    onPress: Title.props.onPress ? this._emitNavBarTitlePress.bind(this, route) : null,
                    style: [titleStyle, Title.props.style],
                  });
                } else {
                  Title = (
                    <NavBarTitle
                      onPress={Title.touchable ? this._emitNavBarTitlePress.bind(this, route) : null}
                      text={Title.text}
                      textStyle={[titleStyle, Title.style]}
                    />
                  )
                }
              }
            }

            return Title;
          },
        }} />
    )
  }

  _onWillFocus = (route) => {
    const component = route.component;
    const navBar = this.refs.navigator &&
      this.refs.navigator._navBar;
    const navigationDelegate = getNavigationDelegate(component);

    if (navBar && navigationDelegate) {
      navigationDelegate.navBarIsHidden ?
        navBar.hide() :
        navBar.show();
    }
  };

  _emitNavBarTitlePress = (route) => {
    this.refs.navigator.navigationContext
      .emit(constants.TITLE_PRESS_EVENT, {route})
  };

  _emitNavBarLeftBtnPress = (route) => {
    this.refs.navigator.navigationContext
      .emit(constants.LEFT_BTN_PRESS_EVENT, {route})
  };

  _emitNavBarRightBtnPress = (route) => {
    this.refs.navigator.navigationContext
      .emit(constants.RIGHT_BTN_PRESS_EVENT, {route})
  };

  render() {
    const {
      initialRoute,
      defaultSceneConfig,
      navBarStyle,
      navBarComponentsDefaultStyles,
      style,
      sceneStyle,
      navBarBackIcon,
    } = this.props;

    const navigationDelegate = getNavigationDelegate(initialRoute.component);

    return (
      <Navigator
        ref={'navigator'}
        initialRoute={initialRoute}
        renderScene={this._renderScene}
        configureScene={this._configureScene}
        defaultSceneConfig={defaultSceneConfig}
        navigationBar={this._renderNavigationBar(
          navBarStyle,
          navBarComponentsDefaultStyles,
          navigationDelegate ?
            navigationDelegate.navBarIsHidden :
            false,
          navBarBackIcon
        )}
        sceneStyle={sceneStyle}
        onWillFocus={this._onWillFocus}
        style={[
          styles.navigator,
          style,
        ]}
      />
    )
  }

  static propTypes = {
    initialRoute: Navigator.propTypes.initialRoute,
    defaultSceneConfig: PropTypes.object,
    style: View.propTypes.style,
    navBarStyle: View.propTypes.style,
    navBarComponentsDefaultStyles: PropTypes.shape({
      title: PropTypes.object,
      leftBtn: PropTypes.object,
      rightBtn: PropTypes.object,
    }),
    navBarBackIcon: PropTypes.object,
    sceneStyle: View.propTypes.style,
  };

  static defaultProps = {
    defaultSceneConfig: React.Platform.OS === 'android' ?
      Navigator.SceneConfigs.FadeAndroid :
      Navigator.SceneConfigs.PushFromRight,
  };

  static navBarHeight = Scene.navBarHeight;
}

const styles = StyleSheet.create({
  navigator: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

YANavigator.Scene = Scene;
