import React from 'react';
import PropTypes from 'prop-types';
import NavBar from './NavBar';
import Scene from './Scene';
import { getNavigationDelegate, replaceInstanceEventedProps } from './utils';
import FBNavigator from './FBNavigator';

import {
  StyleSheet,
  Platform,
  BackHandler,
  ViewPropTypes,
} from 'react-native';

const VALID_EVENTED_PROPS = [
  'onPress',
  'onValueChange',
  'onChange',
  'onSelection',
  'onChangeText',
  'onBlur',
  'onFocus',
  'onSelectionChange',
  'onSubmitEditing',
];

export default class YANavigator extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    return {
      shouldHandleAndroidBack: nextProps.shouldHandleAndroidBack,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      shouldHandleAndroidBack: props.shouldHandleAndroidBack,
    }

    this.navBarParts = {};
  }

  componentDidMount() {
    const navigatorMethods = [
      'getCurrentRoutes',
      'jumpBack',
      'jumpForward',
      'jumpTo',
      'push',
      'pop',
      'popN',
      'replace',
      'replaceAtIndex',
      'replacePrevious',
      'replacePreviousAndPop',
      'resetTo',
      'immediatelyResetRouteStack',
      'popToRoute',
      'popToTop',
    ];

    navigatorMethods.forEach((method) => {
      this[method] = this.fbNavigator[method];
    })

    this.fbNavigator.setShouldHandleAndroidBack = this.setShouldHandleAndroidBack.bind(this);
    this.fbNavigator.forceUpdateNavBar = this.forceUpdateNavBar.bind(this);
    this.fbNavigator.showNavBar = this.showNavBar.bind(this);
    this.fbNavigator.hideNavBar = this.hideNavBar.bind(this);

    this.fbNavigator.navBarParts = this.navBarParts;

    if (Platform.OS === 'android') {
      this._backPressSub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!this.state.shouldHandleAndroidBack) return false;

        const navState = this.fbNavigator.state;
        const presentedComponent =
          navState.routeStack[navState.presentedIndex].component;
        const navigationDelegate = getNavigationDelegate(presentedComponent);

        if (navigationDelegate && navigationDelegate.onAndroidBackPress) {

          navigationDelegate.onAndroidBackPress(navigator);

          return true;
        } else if (navState.routeStack.length > 1) {
          this.pop();

          return true;
        }

       return false;
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialRoute.component !== prevProps.initialRoute.component) {
      this.resetTo(this.props.initialRoute);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this._backPressSub.remove();
      this._backPressSub = null;
    }

    this.fbNavigator.navBarParts = null;
  }

  setShouldHandleAndroidBack(should) {
    this.setState({
      shouldHandleAndroidBack: should,
    });
  }

  forceUpdateNavBar() {
    this.fbNavigator._navBar.forceUpdate();
  }

  showNavBar(args) {
    this.fbNavigator._navBar.show(args);
  }

  hideNavBar(args) {
    this.fbNavigator._navBar.hide(args);
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

  _renderNavigationBar = () => {
    const {
      initialRoute,
      initialRouteStack,
      navBarStyle,
      navBarBackBtn,
      navBarUnderlay,
      useNavigationBar,
      navBarFixedHeight,
      navBarCrossPlatformUI,
      customEventedProps,
      eachSceneProps,
    } = this.props;

    if (!useNavigationBar) return null;

    const eventedProps = VALID_EVENTED_PROPS.concat(customEventedProps);

    const navigationDelegate = getNavigationDelegate(
      (initialRoute && initialRoute.component) ||
      (initialRouteStack && initialRouteStack.length &&
        initialRouteStack[initialRouteStack.length - 1].component)
    );

    const isHiddenOnInit = navigationDelegate ?
        navigationDelegate.navBarIsHidden :
        false;

    return (
      <NavBar
        isHiddenOnInit={isHiddenOnInit}
        style={navBarStyle}
        backIcon={navBarBackBtn.icon}
        underlay={navBarUnderlay}
        fixedHeight={navBarFixedHeight}
        crossPlatformUI={navBarCrossPlatformUI}
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

              LeftPart = navigationDelegate.renderNavBarLeftPart({...route.props, ...eachSceneProps});

              if (!LeftPart) return null;

              const ref = (ref) => this.navBarParts[`${navigationDelegate.id ||
                `${navigator.state.presentedIndex + 1}_scene`}_rightPart`] = ref;

              if (typeof LeftPart === 'object' && React.isValidElement(LeftPart)) {
                const children =
                  React.Children.toArray(LeftPart.props.children).map((child) => {
                    const {reactElement, events} =
                      replaceInstanceEventedProps(
                        child,
                        eventedProps,
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
                    eventedProps,
                    navigationDelegate._events,
                    route,
                    navigator.navigationContext
                  )

                navigationDelegate._events.concat(events.filter((event) => {
                  return navigationDelegate._events.indexOf(event) < 0;
                }));

                LeftPart = reactElement;

                LeftPart = React.cloneElement(LeftPart, {ref}, children)
              } else if (typeof LeftPart === 'function') {
                const props = {};

                LeftPart.propTypes && eventedProps.forEach((validProp) => {
                  if (LeftPart.propTypes[validProp]) {
                    const event = `onNavBarLeftPart${validProp.replace(/^on/, '')}`

                    if (navigationDelegate._events.indexOf(event) < 0) {
                      navigationDelegate._events.push(event)
                    }

                    props[validProp] = (e) => navigator.navigationContext
                      .emit(event, {route, e});
                  }
                });

                LeftPart = <LeftPart ref={ref} {...props} />
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
                  onPress: () => {
                    navigator.pop();
                    navigator.navigationContext.emit('onNavBarBackBtnPress', {route});
                  },
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

                    if (navigationDelegate._events.indexOf(event) < 0) {
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

              RightPart = navigationDelegate.renderNavBarRightPart({...route.props, ...eachSceneProps});

              if (!RightPart) return null;

              const ref = (ref) => this.navBarParts[`${navigationDelegate.id ||
                `${navigator.state.presentedIndex + 1}_scene`}_rightPart`] = ref;

              if (typeof RightPart === 'object' && React.isValidElement(RightPart)) {
                const children =
                  React.Children.toArray(RightPart.props.children).map((child) => {
                    const {reactElement, events} =
                      replaceInstanceEventedProps(
                        child,
                        eventedProps,
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
                    eventedProps,
                    navigationDelegate._events,
                    route,
                    navigator.navigationContext
                  )

                navigationDelegate._events.concat(events.filter((event) => {
                  return navigationDelegate._events.indexOf(event) < 0;
                }));

                RightPart = reactElement;

                RightPart = React.cloneElement(RightPart, {ref}, children)
              } else if (typeof RightPart === 'function') {
                const props = {};

                RightPart.propTypes && eventedProps.forEach((validProp) => {
                  if (RightPart.propTypes[validProp]) {
                    const event = `onNavBarRightPart${validProp.replace(/^on/, '')}`

                    if (navigationDelegate._events.indexOf(event) < 0) {
                      navigationDelegate._events.push(event)
                    }

                    props[validProp] = (e) => navigator.navigationContext
                      .emit(event, {route, e});
                  }
                });

                RightPart = <RightPart ref={ref} {...props} />
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

              Title = navigationDelegate.renderTitle({...route.props, ...eachSceneProps});

              if (!Title) return null;

              const ref = (ref) => this.navBarParts[`${navigationDelegate.id ||
                `${navigator.state.presentedIndex + 1}_scene`}_title`] = ref;

              if (typeof Title === 'object' && React.isValidElement(Title)) {
                const children =
                  React.Children.toArray(Title.props.children).map((child) => {
                    const {reactElement, events} =
                      replaceInstanceEventedProps(
                        child,
                        eventedProps,
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
                    eventedProps,
                    navigationDelegate._events,
                    route,
                    navigator.navigationContext
                  )

                navigationDelegate._events.concat(events.filter((event) => {
                  return navigationDelegate._events.indexOf(event) < 0;
                }));

                Title = reactElement;

                Title = React.cloneElement(Title, {ref}, children)
              } else if (typeof Title === 'function') {
                const props = {};

                Title.propTypes && eventedProps.forEach((validProp) => {
                  if (Title.propTypes[validProp]) {
                    const event = `onNavBarTitle${validProp.replace(/^on/, '')}`

                    if (navigationDelegate._events.indexOf(event) < 0) {
                      navigationDelegate._events.push(event)
                    }

                    props[validProp] = (e) => navigator.navigationContext
                      .emit(event, {route, e});
                  }
                });

                Title = <Title ref={ref} {...props} />
              }
            }

            return Title;
          },
        }} />
    )
  }

  _onWillFocus = (route) => {
    const component = route.component;
    const state = this.fbNavigator && this.fbNavigator.state;

    if (state) {
      setTimeout(() => {
        const index = state.presentedIndex;

        for (let i = state.routeStack.length - 1; i > index; i--) {
          if (state.routeStack[i] &&
              state.routeStack[i].props &&
              state.routeStack[i].props.onSceneWillBlur) {

            state.routeStack[i].props.onSceneWillBlur(
              route.__navigatorRouteID !== undefined
            );
          }
        }
      }, 100);
    }

    const navBar = navigator && navigator._navBar;
    const navigationDelegate = getNavigationDelegate(component);

    if (navBar && navigationDelegate) {
      navigationDelegate.navBarIsHidden ?
        navBar.hide() :
        navBar.show();
    }
  }

  _setFBNavigatorRef = (ref) => this.fbNavigator = ref;

  render() {
    const {
      initialRoute,
      initialRouteStack,
      defaultSceneConfig,
      style,
      sceneStyle,
    } = this.props;

    return (
      <FBNavigator
        ref={this._setFBNavigatorRef}
        initialRoute={initialRoute}
        initialRouteStack={initialRouteStack}
        renderScene={this._renderScene}
        configureScene={this._configureScene}
        defaultSceneConfig={defaultSceneConfig}
        navigationBar={this._renderNavigationBar()}
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
    initialRoute: FBNavigator.propTypes.initialRoute,
    initialRouteStack: FBNavigator.propTypes.initialRouteStack,
    defaultSceneConfig: PropTypes.object,
    useNavigationBar: PropTypes.bool,
    style: ViewPropTypes.style,
    navBarStyle: ViewPropTypes.style,
    navBarFixedHeight: PropTypes.number,
    navBarUnderlay: PropTypes.object,
    navBarBackBtn: PropTypes.shape({
      icon: PropTypes.object,
      textStyle: PropTypes.object,
    }),
    navBarCrossPlatformUI: PropTypes.bool,
    sceneStyle: PropTypes.object,
    eachSceneProps: PropTypes.object,
    shouldHandleAndroidBack: PropTypes.bool,
    customEventedProps: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    defaultSceneConfig: Platform.OS === 'android' ?
      FBNavigator.SceneConfigs.FadeAndroid :
      FBNavigator.SceneConfigs.PushFromRight,
    useNavigationBar: true,
    shouldHandleAndroidBack: true,
    navBarFixedHeight: 0,
    navBarCrossPlatformUI: false,
    navBarBackBtn: {
      textStyle: {},
    },
    customEventedProps: [],
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
YANavigator.FBNavigator = FBNavigator;
