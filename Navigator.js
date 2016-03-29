import React from 'react-native';

import NavBar from './NavBar';
import NavBarTitle from './NavBarTitle';
import NavBarBtn from './NavBarBtn';

import Scene from './Scene'

import * as constants from './constants';

const {
  View,
  StyleSheet,
  Navigator,
  Animated,
  PropTypes,
} = React;

export default class YANavigator extends React.Component {
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
    return (route.component.navigationDelegate &&
            route.component.navigationDelegate.sceneConfig) ||
            this.props.defaultSceneConfig;
  };

  _renderNavigationBar = (
    navBarStyle,
    navBarComponentsDefaultStyles = {},
    isHiddenOnInit
  ) => {

    const titleStyle = navBarComponentsDefaultStyles.title;
    const leftBtnStyle = navBarComponentsDefaultStyles.leftBtn;
    const rightBtnStyle = navBarComponentsDefaultStyles.rightBtn;

    return (
      <NavBar
        isHiddenOnInit={isHiddenOnInit}
        style={[styles.navBar, navBarStyle]}
        routeMapper={{
          LeftButton: (route) => {
            let LeftBtn = null;

            if (route.component.navigationDelegate &&
                route.component.navigationDelegate.getNavBarLeftBtn) {

              LeftBtn =
                route.component.navigationDelegate
                .getNavBarLeftBtn(route.props || {});

              if (!LeftBtn) return LeftBtn;

              if (typeof LeftBtn === 'object') {
                if (React.isValidElement(LeftBtn)) {
                  const _leftBtnStyle = Object.assign({}, leftBtnStyle);

                  delete _leftBtnStyle.color;

                  LeftBtn = React.createElement(NavBarBtn, {
                    onPress: this._emitNavBarLeftBtnPress.bind(this, route),
                    side: 'left',
                    style: leftBtnStyle,
                  }, LeftBtn);
                } else {
                  LeftBtn = (
                    <NavBarBtn
                      onPress={this._emitNavBarLeftBtnPress.bind(this, route)}
                      side={'left'}
                      text={LeftBtn.text}
                      textStyle={[LeftBtn.style, leftBtnStyle]}/>
                  )
                }
              } else if (typeof LeftBtn === 'function') {
                LeftBtn =
                  (<NavBarBtn
                    onPress={this._emitNavBarLeftBtnPress.bind(this, route)}
                    style={leftBtnStyle}>
                    <LeftBtn />
                  </NavBarBtn>)
              }
            }

            return LeftBtn;
          },

          RightButton: (route) => {
            let RightBtn = null;

            if (route.component.navigationDelegate &&
                route.component.navigationDelegate.getNavBarRightBtn) {

              RightBtn =
                route.component.navigationDelegate
                .getNavBarRightBtn(route.props || {});

              if (!RightBtn) return RightBtn;

              if (typeof RightBtn === 'object') {
                if (React.isValidElement(RightBtn)) {
                  const _rightBtnStyle = Object.assign({}, rightBtnStyle);

                  delete _rightBtnStyle.color;

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
                      textStyle={[RightBtn.style, rightBtnStyle]}/>
                  )
                }
              } else if (typeof RightBtn === 'function') {
                RightBtn =
                  (<NavBarBtn
                    onPress={this._emitNavBarRightBtnPress.bind(this, route)}
                    style={rightBtnStyle}>
                    <RightBtn />
                  </NavBarBtn>)
              }
            }

            return RightBtn;
          },

          Title: (route) => {
            let Title = null;

            if (route.component.navigationDelegate &&
                route.component.navigationDelegate.getNavBarTitle) {

              Title =
                route.component.navigationDelegate
                .getNavBarTitle(route.props || {});

              if (!Title) return Title;

              if (typeof Title === 'object') {
                if (React.isValidElement(Title)) {
                  Title = React.cloneElement(Title, {
                    onPress: Title.props.onPress ? this._emitNavBarTitlePress.bind(this, route) : null,
                    style: [Title.props.style, titleStyle],
                  });
                } else {
                  Title = (
                    <NavBarTitle
                      onPress={Title.onPress ? this._emitNavBarTitlePress.bind(this, route) : null}
                      text={Title.text}
                      textStyle={[Title.style, titleStyle]}
                    />
                  )
                }
              }
            }

            return Title;
          },
        }} />
    )
  };

  _onWillFocus = (route) => {
    const component = route.component;
    const navBar = this.refs.navigator &&
      this.refs.navigator._navBar;

    if (navBar && component.navigationDelegate) {
      component.navigationDelegate.navBarIsHidden ?
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
    } = this.props;

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
          initialRoute.component.navigationDelegate ?
            initialRoute.component.navigationDelegate.navBarIsHidden :
            false
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
