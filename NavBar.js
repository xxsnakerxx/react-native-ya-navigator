import React from 'react-native';

import Ionicon from 'react-native-vector-icons/Ionicons'

import { getNavigationDelegate, getOrientation } from './utils';

const {
  View,
  Text,
  TouchableOpacity,
  Navigator,
  Animated,
  StyleSheet,
  PropTypes,
  Dimensions,
  Platform,
} = React;

const IS_IOS = Platform.OS === 'ios';

const NAV_BAR_STYLES = Navigator.NavigationBar.Styles;
const NAV_BAR_DEFAULT_BACKGROUND_COLOR = 'white';
const NAV_BAR_DEFAULT_TINT_COLOR = 'black';
const NAV_HEIGHT = NAV_BAR_STYLES.General.TotalNavHeight;
const SCREEN_WIDTH = Dimensions.get('window').width;
const NAVBAR_LANDSCAPE_HEIGHT_IOS = 32;
const NAVBAR_LANDSCAPE_HEIGHT_ANDROID = 40;
const DEFAULT_IOS_BACK_ICON = 'ios-arrow-back';
const DEFAULT_ANDROID_BACK_ICON = 'android-arrow-back';

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opacity: new Animated.Value(props.isHiddenOnInit ? 0 : 1),
      y: new Animated.Value(props.isHiddenOnInit ? -NAV_HEIGHT : 0),
      animationProgress: new Animated.Value(0),
      animationFromIndex: 0,
      animationToIndex: 0,
      prevTitleXPos: 0,
      prevTitleWidth: 0,
      backIconWidth: 0,
      width: SCREEN_WIDTH,
      height: getOrientation() === 'PORTRAIT' ? NAV_HEIGHT :
        (IS_IOS ? NAVBAR_LANDSCAPE_HEIGHT_IOS : NAVBAR_LANDSCAPE_HEIGHT_ANDROID),
    }
  }

  _setTitle(title) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const routeProps = currentRoute.props || {};

    if (navigationDelegate) {
      navigationDelegate.renderTitle = (routeProps) => title;
    }
  }

  _setLeftPart(part) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const routeProps = currentRoute.props || {};

    if (navigationDelegate) {
      navigationDelegate.renderNavBarLeftPart = (routeProps) => part;
    }
  }

  _setRightPart(part) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const routeProps = currentRoute.props || {};

    if (navigationDelegate) {
      navigationDelegate.renderNavBarRightPart = (routeProps) => part;
    }
  }

  updateUI(ui) {
    ui.title !== undefined && this._setTitle(ui.title);
    ui.leftPart !== undefined && this._setLeftPart(ui.leftPart);
    ui.rightPart !== undefined && this._setRightPart(ui.rightPart);

    this.forceUpdate();
  }

  updateProgress(progress, fromIndex, toIndex) {
    this.state = Object.assign({}, this.state, {
      animationFromIndex: fromIndex,
      animationToIndex: toIndex,
    })

    this.state.animationProgress.setValue(progress);

    this.forceUpdate();
  }

  immediatelyRefresh() {
    this.setState({
      opacity: new Animated.Value(this.props.isHiddenOnInit ? 0 : 1),
      y: new Animated.Value(this.props.isHiddenOnInit ? -NAV_HEIGHT : 0),
      animationProgress: new Animated.Value(0),
      animationFromIndex: 0,
      animationToIndex: 0,
      prevTitleXPos: 0,
      prevTitleWidth: 0,
      backIconWidth: 0,
    });
  }

  show(type = 'fade') {
    if (type === 'fade') {
      this.state.y.setValue(0);

      Animated.timing(this.state.opacity, {
        toValue: 1,
        duration: 200,
      }).start();
    } else if (type === 'slide') {
      this.state.opacity.setValue(1);

      Animated.timing(this.state.y, {
        toValue: 0,
        duration: 100,
      }).start();
    }
  }

  hide(type = 'fade') {
    if (type === 'fade') {
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: 200,
      }).start(() => {
        this.state.y.setValue(-NAV_HEIGHT);
      });
    } else if (type === 'slide') {
      Animated.timing(this.state.y, {
        toValue: -NAV_HEIGHT,
        duration: 100,
      }).start(() => {
        this.state.opacity.setValue(0);
      });
    }
  }

  _onBackIconLayout = (e) => {
    this.setState({
      backIconWidth: e.nativeEvent.layout.width,
    })
  };

  _onPrevTitleLayout = (e) => {
    const { layout } = e.nativeEvent;

    this.setState({
      prevTitleWidth: layout.width,
      prevTitleXPos: layout.x,
    })
  };

  _onNavBarLayout = (e) => {
    const { layout } = e.nativeEvent;

    this.setState({
      width: layout.width,
      height: getOrientation() === 'PORTRAIT' ? NAV_HEIGHT :
        (IS_IOS ? NAVBAR_LANDSCAPE_HEIGHT_IOS : NAVBAR_LANDSCAPE_HEIGHT_ANDROID),
    });
  };

  render() {
    const {
      style,
      navState,
      routeMapper,
      navigator,
      backIcon,
    } = this.props;

    const {
      animationToIndex,
      animationFromIndex,
      animationProgress,
      y,
      opacity,
      width,
      height,
      prevTitleXPos,
      prevTitleWidth,
      backIconWidth,
    } = this.state;

    let underlay = this.props.underlay;

    if (React.isValidElement(underlay)) {
      underlay = React.cloneElement(underlay, {
        style: {
          ...underlay.props.style,
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      })
    } else {
      underlay = null;
    }

    const leftPartWidth = IS_IOS ? width / 4 : 48;
    const rightPartWidth = width / (IS_IOS ? 4 : 3);
    const titlePartWidth = width - leftPartWidth - rightPartWidth;

    const routeStack = navState.routeStack;

    const navBarBackgroundColor =
      routeStack[animationToIndex] &&
      routeMapper.navBarBackgroundColor(routeStack[animationToIndex]) ||
      (style && style.backgroundColor) ||
      NAV_BAR_DEFAULT_BACKGROUND_COLOR;

    const prevNavBarBackgroundColor =
      routeStack[animationFromIndex] &&
      routeMapper.navBarBackgroundColor(routeStack[animationFromIndex]) ||
      (style && style.backgroundColor) ||
      NAV_BAR_DEFAULT_BACKGROUND_COLOR;

    let navBarBackgroundColorStyle = {
      backgroundColor: navBarBackgroundColor,
    };

    if (navBarBackgroundColor !== prevNavBarBackgroundColor) {
      navBarBackgroundColorStyle = {
        backgroundColor: animationProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [prevNavBarBackgroundColor, navBarBackgroundColor],
          extrapolate: false,
        }),
      };
    }

    const isGoingBack = animationToIndex < animationFromIndex;

    const route =
      navState.routeStack[isGoingBack ? animationFromIndex : animationToIndex];
    const prevRoute =
      navState.routeStack[isGoingBack ? animationToIndex : animationFromIndex];

    const title =
      route && routeMapper.Title((route || prevRoute), navigator) || null;
    const prevTitle =
      prevRoute && routeMapper.Title((prevRoute || route), navigator) || null;

    let leftPart =
      route && routeMapper.LeftPart(
        route || prevRoute,
        navigator,
        isGoingBack ? animationFromIndex : animationToIndex,
        navState
      ) || null;

    let prevLeftPart =
      prevRoute && routeMapper.LeftPart(
        prevRoute || route,
        navigator,
        (isGoingBack ? animationFromIndex : animationToIndex) - 1,
        navState
      ) || null;

    let backBtn;
    let prevBackBtn;

    const backIconName = IS_IOS ?
      DEFAULT_IOS_BACK_ICON :
      DEFAULT_ANDROID_BACK_ICON;

    const backIconSize = IS_IOS ?
      (getOrientation() === 'PORTRAIT' ? 32 : 26) :
      24;

    if (leftPart && leftPart.isBackBtn) {
      backBtn = (
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              opacity: animationProgress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: isGoingBack ? [1, 0, 0] : [0, 1, 1],
              }),
            },
          ]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={leftPart.onPress}>
            {backIcon ||
              <Ionicon
                style={styles.backBtnIcon}
                onLayout={this._onBackIconLayout}
                name={backIconName}
                size={backIconSize}
                color={
                  leftPart.textStyle.color ||
                  NAV_BAR_DEFAULT_TINT_COLOR} />
            }
            {IS_IOS &&
              <Animated.Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.backBtnText,
                  leftPart.textStyle,
                  {
                    width: leftPartWidth - backIconWidth - 10 - 2 - 10,
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ?
                            [2, leftPartWidth + prevTitleXPos - (backIconWidth + 10 + 2)] :
                            [leftPartWidth + prevTitleXPos - (backIconWidth + 10 + 2), 2],
                        }),
                      },
                    ],
                  },
                ]}>
                {leftPart.text}
              </Animated.Text>
            }
          </TouchableOpacity>
        </Animated.View>
      )

      leftPart = null;
    }

    if (prevLeftPart && prevLeftPart.isBackBtn) {
      prevBackBtn = (
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              transform: [
                {
                  translateX: animationProgress.interpolate({
                    inputRange: [0, 0.999, 1],
                    outputRange: isGoingBack ? [0, 0, 0] : [0, -SCREEN_WIDTH, -SCREEN_WIDTH],
                  }),
                },
              ],
              opacity: animationProgress.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: isGoingBack ? [0, 1, 1] : [1, 0, 0],
              }),
            },
          ]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={prevLeftPart.onPress}>
            {backIcon ||
              <Ionicon
                style={styles.backBtnIcon}
                onLayout={this._onBackIconLayout}
                name={backIconName}
                size={backIconSize}
                color={
                  prevLeftPart.textStyle.color ||
                  NAV_BAR_DEFAULT_TINT_COLOR} />
            }
            {IS_IOS &&
              <Animated.Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.backBtnText,
                  prevLeftPart.textStyle,
                  {
                    width: leftPartWidth - backIconWidth - 10 - 2 - 10,
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ? [-leftPartWidth, 2] : [2, -leftPartWidth / 2],
                        }),
                      },
                    ],
                  },
                ]}>
                {prevLeftPart.text}
              </Animated.Text>
            }
          </TouchableOpacity>
        </Animated.View>
      )

      prevLeftPart = null;
    }

    let rightPart =
      route && routeMapper.RightPart((route || prevRoute), navigator) || null;
    let prevRightPart =
      prevRoute && routeMapper.RightPart((prevRoute || route), navigator) || null;

    return (
      <Animated.View
        onLayout={this._onNavBarLayout}
        style={[
          style,
          styles.navBar,
          navBarBackgroundColorStyle,
          {
            height,
            paddingTop: getOrientation() === 'PORTRAIT' ?
              NAV_BAR_STYLES.General.StatusBarHeight :
              0,
            opacity: isGoingBack &&
                    getNavigationDelegate(prevRoute.component) &&
                    getNavigationDelegate(prevRoute.component).navBarIsHidden ?
              animationProgress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 0],
              }) :
              opacity,
            transform: [
              {
                translateY: y,
              },
            ],
          },
        ]}>
        {underlay}
        <View
          style={[
            styles.titleContainer,
            {
              left: IS_IOS ? (width - titlePartWidth) / 2 : leftPartWidth + 10,
              width: titlePartWidth,
              height: getOrientation() === 'PORTRAIT' ?
                height - NAV_BAR_STYLES.General.StatusBarHeight :
                height,
            },
          ]}>
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  transform: IS_IOS ? [
                    {
                      translateX: animationProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange:
                          isGoingBack ?
                            [-(leftPartWidth + ((titlePartWidth - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2), 0] :
                            [0, -(leftPartWidth + ((titlePartWidth - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2)],
                      }),
                    },
                  ] : [],
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: isGoingBack ? [0, 1, 1] : [1, 0, 0],
                  }),
                },
              ]}
            >
              <View
                style={{
                  width: titlePartWidth,
                  alignItems: IS_IOS ? 'center' : 'flex-start',
                }}>
                <View
                  onLayout={IS_IOS ? this._onPrevTitleLayout : null}>
                  {prevTitle}
                </View>
              </View>
            </Animated.View>
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  justifyContent: IS_IOS ? 'center' : 'flex-start',
                  transform: IS_IOS ? [
                    {
                      translateX: animationProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange:
                          isGoingBack ?
                            [0, (leftPartWidth + ((titlePartWidth - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2)] :
                            [(leftPartWidth + ((titlePartWidth - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2), 0],
                      }),
                    },
                  ] : [],
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: isGoingBack ? [1, 0, 0] : [0, 1, 1],
                  }),
                },
              ]}
            >
              <View
                style={{
                  width: titlePartWidth,
                  alignItems: IS_IOS ? 'center' : 'flex-start',
                }}>
                {title}
              </View>
            </Animated.View>
        </View>

        <View
          style={[
            styles.navBarLeftPartContainer,
            {
              width: leftPartWidth,
              height: getOrientation() === 'PORTRAIT' ?
                height - NAV_BAR_STYLES.General.StatusBarHeight :
                height,
            },
          ]}>
          {prevLeftPart ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [0, 1] : [1, 0],
                  }),
                },
              ]}
            >
              <View
                style={{
                  width: leftPartWidth,
                  alignItems: 'flex-start',
                }}>
                {prevLeftPart}
              </View>
            </Animated.View> :
            null
          }
          {leftPart && animationFromIndex !== animationToIndex ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [1, 0] : [0, 1],
                  }),
                },
              ]}
            >
              <View
                style={{
                  width: leftPartWidth,
                  alignItems: 'flex-start',
                }}>
                {leftPart}
              </View>
            </Animated.View> :
            null
          }
          {backBtn}
          {prevBackBtn}
        </View>

        <View
          style={[
            styles.navBarRightPartContainer,
            {
              width: rightPartWidth,
              height: getOrientation() === 'PORTRAIT' ?
                height - NAV_BAR_STYLES.General.StatusBarHeight :
                height,
            },
          ]}>
          {prevRightPart ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [0, 1] : [1, 0],
                  }),
                },
              ]}
            >
              <View
                style={{
                  width: rightPartWidth,
                  alignItems: 'flex-end',
                }}>
                {prevRightPart}
              </View>
            </Animated.View> :
            null
          }
          {rightPart && animationFromIndex !== animationToIndex ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [1, 0] : [0, 1],
                  }),
                },
              ]}
            >
              <View
                style={{
                  width: rightPartWidth,
                  alignItems: 'flex-end',
                }}>
                {rightPart}
              </View>
            </Animated.View> :
            null
          }
        </View>

      </Animated.View>
    )
  }

  static propTypes = {
    style: View.propTypes.style,
    isHiddenOnInit: PropTypes.bool,
    navState: Navigator.NavigationBar.propTypes.navState,
    routeMapper: PropTypes.shape({
      Title: PropTypes.func.isRequired,
      LeftPart: PropTypes.func.isRequired,
      RightPart: PropTypes.func.isRequired,
      navBarBackgroundColor: PropTypes.func.isRequired,
    }).isRequired,
    underlay: PropTypes.object,
    backIcon: PropTypes.object,
  };
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    flexDirection: 'row',
  },
  titleContainer: {
    position: 'absolute',
  },
  animatedWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  navBarLeftPartContainer: {
    position: 'absolute',
    left: 10,
    height: NAV_BAR_STYLES.General.NavBarHeight,
  },
  navBarRightPartContainer: {
    position: 'absolute',
    right: 10,
    height: NAV_BAR_STYLES.General.NavBarHeight,
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: IS_IOS ? 'flex-start' : 'center',
  },
  backBtnText: {
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  backBtnIcon: {
    top: 1,
  },
})
