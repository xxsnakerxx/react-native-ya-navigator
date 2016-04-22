import React from 'react-native';

import NavBar from './NavBar';
import Scene from './Scene';

import { getNavigationDelegate, replaceInstanceEventedProps } from './utils';

const {
  View,
  StyleSheet,
  Navigator,
  PropTypes,
  Platform,
  BackAndroid,
} = React;

const VALID_EVENTED_PROPS = ['onPress', 'onValueChange', 'onChange', 'onSelection'];

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
      this._backPressSub = null;
    }
  }

  _renderScene = (route, navigator) => {
    let Component;

    const { eachSceneProps } = this.props;

    if (typeof route.component === 'object') {
      Component = React.cloneElement(route.component, {
        navigator,
        ...route.props,
        ...eachSceneProps,
      });
    } else if (typeof route.component === 'function') {
      Component = (
        <route.component
          navigator={navigator}
          {...route.props}
          {...eachSceneProps}
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
    isHiddenOnInit,
    navBarBackBtn,
    navBarUnderlay,
  ) {

    return (
      <NavBar
        isHiddenOnInit={isHiddenOnInit}
        style={navBarStyle}
        backIcon={navBarBackBtn.icon}
        underlay={navBarUnderlay}
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

          LeftPart: (route, navigator, index, state) => {
            let LeftPart = null;

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.renderNavBarLeftPart) {

              navigationDelegate._events = navigationDelegate._events || [];

              LeftPart = navigationDelegate.renderNavBarLeftPart(route.props || {});

              if (!LeftPart) return null;

              if (typeof LeftPart === 'object' && React.isValidElement(LeftPart)) {
                const children =
                  React.Children.toArray(LeftPart.props.children).map((child) => {
                    const {reactElement, events} =
                      replaceInstanceEventedProps(
                        child,
                        VALID_EVENTED_PROPS,
                        navigationDelegate._events,
                        route,
                        navigator.navigationContext
                      )

                    navigationDelegate._events.concat(events.filter((event) => {
                      return navigationDelegate._events.indexOf(event) < 0;
                    }));

                    return reactElement
                  })

                const {reactElement, events} =
                  replaceInstanceEventedProps(
                    LeftPart,
                    VALID_EVENTED_PROPS,
                    navigationDelegate._events,
                    route,
                    navigator.navigationContext
                  )

                navigationDelegate._events.concat(events.filter((event) => {
                  return navigationDelegate._events.indexOf(event) < 0;
                }));

                LeftPart = reactElement;

                LeftPart = React.cloneElement(LeftPart, {
                  ref: 'leftPart',
                }, children)
              } else if (typeof LeftPart === 'function') {
                const props = {};

                LeftPart.propTypes && VALID_EVENTED_PROPS.forEach((validProp) => {
                  if (LeftPart.propTypes[validProp]) {
                    const event = `onNavBarLeftPart${validProp.replace(/^on/, '')}`

                    if (!navigationDelegate._events.includes(event)) {
                      navigationDelegate._events.push(event)
                    }

                    props[validProp] = (e) => navigator.navigationContext
                      .emit(event, {route, e});
                  }
                })

                LeftPart = <LeftPart ref={'leftPart'} {...props} />
              }
            } else {
              if (index > 0) {
                // tell navBar to render back button
                const prevRoute = state.routeStack[index - 1];
                const previousComponent = prevRoute.component;
                const previousNavigationDelegate = getNavigationDelegate(previousComponent);

                let backBtnText = '';

                if (previousNavigationDelegate &&
                    typeof previousNavigationDelegate.backBtnText === 'string') {

                  backBtnText = previousNavigationDelegate.backBtnText;
                }

                const navigationDelegate = state.routeStack[index] &&
                  getNavigationDelegate(state.routeStack[index].component);

                const backBtnConfig = {
                  isBackBtn: true,
                  text: backBtnText,
                  onPress: navigator.pop,
                  textStyle: navBarBackBtn.textStyle,
                }

                if (navigationDelegate) {
                  if (navigationDelegate.navBarBackBtnColor) {
                    backBtnConfig.textStyle.color =
                      navigationDelegate.navBarBackBtnColor;
                  }

                  if (navigationDelegate.overrideBackBtnPress) {
                    navigationDelegate._events = navigationDelegate._events || [];

                    const event = 'onNavBarBackBtnPress'

                    if (!navigationDelegate._events.includes(event)) {
                      navigationDelegate._events.push(event)
                    }

                    backBtnConfig.onPress = () => navigator.navigationContext
                      .emit(event, {route});
                  }
                }

                return backBtnConfig;
              }
            }

            return LeftPart;
          },

          RightPart: (route, navigator) => {
            let RightPart = null;

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.renderNavBarRightPart) {

              navigationDelegate._events = navigationDelegate._events || [];

              RightPart = navigationDelegate.renderNavBarRightPart(route.props || {});

              if (!RightPart) return null;

              if (typeof RightPart === 'object' && React.isValidElement(RightPart)) {
                const children =
                  React.Children.toArray(RightPart.props.children).map((child) => {
                    const {reactElement, events} =
                      replaceInstanceEventedProps(
                        child,
                        VALID_EVENTED_PROPS,
                        navigationDelegate._events,
                        route,
                        navigator.navigationContext
                      )

                    navigationDelegate._events.concat(events.filter((event) => {
                      return navigationDelegate._events.indexOf(event) < 0;
                    }));

                    return reactElement
                  })

                const {reactElement, events} =
                  replaceInstanceEventedProps(
                    RightPart,
                    VALID_EVENTED_PROPS,
                    navigationDelegate._events,
                    route,
                    navigator.navigationContext
                  )

                navigationDelegate._events.concat(events.filter((event) => {
                  return navigationDelegate._events.indexOf(event) < 0;
                }));

                RightPart = reactElement;

                RightPart = React.cloneElement(RightPart, {
                  ref: 'rightPart',
                }, children)
              } else if (typeof RightPart === 'function') {
                const props = {};

                RightPart.propTypes && VALID_EVENTED_PROPS.forEach((validProp) => {
                  if (RightPart.propTypes[validProp]) {
                    const event = `onNavBarRightPart${validProp.replace(/^on/, '')}`

                    if (!navigationDelegate._events.includes(event)) {
                      navigationDelegate._events.push(event)
                    }

                    props[validProp] = (e) => navigator.navigationContext
                      .emit(event, {route, e});
                  }
                })

                RightPart = <RightPart ref={'rightPart'} {...props} />
              }
            }

            return RightPart;
          },

          Title: (route, navigator) => {
            let Title = null;

            const navigationDelegate = getNavigationDelegate(route.component);

            if (navigationDelegate &&
                navigationDelegate.renderTitle) {

              navigationDelegate._events = navigationDelegate._events || [];

              Title = navigationDelegate.renderTitle(route.props || {});

              if (!Title) return null;

              if (typeof Title === 'object' && React.isValidElement(Title)) {
                const children =
                  React.Children.toArray(Title.props.children).map((child) => {
                    const {reactElement, events} =
                      replaceInstanceEventedProps(
                        child,
                        VALID_EVENTED_PROPS,
                        navigationDelegate._events,
                        route,
                        navigator.navigationContext
                      )

                    navigationDelegate._events.concat(events.filter((event) => {
                      return navigationDelegate._events.indexOf(event) < 0;
                    }));

                    return reactElement
                  })

                const {reactElement, events} =
                  replaceInstanceEventedProps(
                    Title,
                    VALID_EVENTED_PROPS,
                    navigationDelegate._events,
                    route,
                    navigator.navigationContext
                  )

                navigationDelegate._events.concat(events.filter((event) => {
                  return navigationDelegate._events.indexOf(event) < 0;
                }));

                Title = reactElement;

                Title = React.cloneElement(Title, {
                  ref: 'title',
                }, children)
              } else if (typeof Title === 'function') {
                const props = {};

                Title.propTypes && VALID_EVENTED_PROPS.forEach((validProp) => {
                  if (Title.propTypes[validProp]) {
                    const event = `onNavBarTitle${validProp.replace(/^on/, '')}`

                    if (!navigationDelegate._events.includes(event)) {
                      navigationDelegate._events.push(event)
                    }

                    props[validProp] = (e) => navigator.navigationContext
                      .emit(event, {route, e});
                  }
                })

                Title = <Title ref={'title'} {...props} />
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

  render() {
    const {
      initialRoute,
      defaultSceneConfig,
      navBarStyle,
      style,
      sceneStyle,
      navBarBackBtn,
      navBarUnderlay,
      useNavigationBar,
    } = this.props;

    const navigationDelegate = getNavigationDelegate(initialRoute.component);

    return (
      <Navigator
        ref={'navigator'}
        initialRoute={initialRoute}
        renderScene={this._renderScene}
        configureScene={this._configureScene}
        defaultSceneConfig={defaultSceneConfig}
        navigationBar={useNavigationBar ? this._renderNavigationBar(
          navBarStyle,
          navigationDelegate ?
            navigationDelegate.navBarIsHidden :
            false,
          navBarBackBtn,
          navBarUnderlay,
        ) : null}
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
    useNavigationBar: PropTypes.bool,
    style: View.propTypes.style,
    navBarStyle: View.propTypes.style,
    navBarUnderlay: PropTypes.object,
    navBarBackBtn: PropTypes.shape({
      icon: PropTypes.object,
      textStyle: PropTypes.object,
    }),
    sceneStyle: View.propTypes.style,
    eachSceneProps: PropTypes.object,
  };

  static defaultProps = {
    defaultSceneConfig: React.Platform.OS === 'android' ?
      Navigator.SceneConfigs.FadeAndroid :
      Navigator.SceneConfigs.PushFromRight,
    useNavigationBar: true,
    navBarBackBtn: {
      textStyle: {},
    },
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
