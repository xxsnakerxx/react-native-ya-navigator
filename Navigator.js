import React from 'react';
import PropTypes from 'prop-types';
import NavBar from './NavBar';
import Scene from './Scene';
import { getNavigationDelegate, replaceInstanceEventedProps } from './utils';
import { Navigator } from 'react-native-deprecated-custom-components';

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
  constructor(props) {
    super(props);

    this.state = {
      shouldHandleAndroidBack: props.shouldHandleAndroidBack,
    }

    // TODO: Remove this when https://github.com/mlabrum/react-native-custom-components/pull/1 will be merged
    console.ignoredYellowBox = ['Warning: Navigator: isMounted'];
  }

  componentDidMount() {
    const navigatorMethods = [
      'getCurrentRoutes',
      'jumpBack',
      'jumpForward',
      'jumpTo',
      'push',
      'pop',
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
      this[method] = this.refs.navigator[method];
    })

    this.refs.navigator.setShouldHandleAndroidBack = this.setShouldHandleAndroidBack.bind(this);

    if (Platform.OS === 'android') {
      this._backPressSub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!this.state.shouldHandleAndroidBack) return false;

        const { navigator } = this.refs;
        const navState = navigator.state;
        const presentedComponent =
          navState.routeStack[navState.presentedIndex].component;
        const navigationDelegate = getNavigationDelegate(presentedComponent);

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

  componentWillReceiveProps(nextProps) {
    this.setState({
      shouldHandleAndroidBack: nextProps.shouldHandleAndroidBack,
    })
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this._backPressSub.remove();
      this._backPressSub = null;
    }
  }

  setShouldHandleAndroidBack(should) {
    this.setState({
      shouldHandleAndroidBack: should,
    });
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
    const eventedProps = VALID_EVENTED_PROPS.concat(this.props.customEventedProps);

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

                const ref = `${navigationDelegate.id ||
                  `${navigator.state.presentedIndex + 1}_scene`}_leftPart`;

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
                })

                const ref = `${navigationDelegate.id ||
                  `${navigator.state.presentedIndex + 1}_scene`}_leftPart`;

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

              RightPart = navigationDelegate.renderNavBarRightPart(route.props || {});

              if (!RightPart) return null;

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

                const ref = `${navigationDelegate.id ||
                  `${navigator.state.presentedIndex + 1}_scene`}_rightPart`;

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
                })

                const ref = `${navigationDelegate.id ||
                  `${navigator.state.presentedIndex + 1}_scene`}_rightPart`;

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

              Title = navigationDelegate.renderTitle(route.props || {});

              if (!Title) return null;

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

                const ref = `${navigationDelegate.id ||
                  `${navigator.state.presentedIndex + 1}_scene`}_title`;

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
                })

                const ref = `${navigationDelegate.id ||
                  `${navigator.state.presentedIndex + 1}_scene`}_title`;

                Title = <Title ref={ref} {...props} />
              }
            }

            return Title;
          },
        }} />
    )
  }

  _onWillFocus = (route) => {
    const { navigator } = this.refs;
    const component = route.component;
    const state = navigator && navigator.state;

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
  };

  render() {
    const {
      initialRoute,
      initialRouteStack,
      defaultSceneConfig,
      navBarStyle,
      style,
      sceneStyle,
      navBarBackBtn,
      navBarUnderlay,
      useNavigationBar,
    } = this.props;

    const navigationDelegate = getNavigationDelegate(
      (initialRoute && initialRoute.component) ||
      (initialRouteStack && initialRouteStack.length &&
        initialRouteStack[initialRouteStack.length - 1].component)
    );

    return (
      <Navigator
        ref={'navigator'}
        initialRoute={initialRoute}
        initialRouteStack={initialRouteStack}
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
    initialRouteStack: Navigator.propTypes.initialRouteStack,
    defaultSceneConfig: PropTypes.object,
    useNavigationBar: PropTypes.bool,
    style: ViewPropTypes.style,
    navBarStyle: ViewPropTypes.style,
    navBarUnderlay: PropTypes.object,
    navBarBackBtn: PropTypes.shape({
      icon: PropTypes.object,
      textStyle: PropTypes.object,
    }),
    sceneStyle: PropTypes.object,
    eachSceneProps: PropTypes.object,
    shouldHandleAndroidBack: PropTypes.bool,
    customEventedProps: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    defaultSceneConfig: Platform.OS === 'android' ?
      Navigator.SceneConfigs.FadeAndroid :
      Navigator.SceneConfigs.PushFromRight,
    useNavigationBar: true,
    shouldHandleAndroidBack: true,
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
