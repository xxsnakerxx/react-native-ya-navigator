import React, { PropTypes } from 'react';

import Ionicon from 'react-native-vector-icons/Ionicons';

import { getNavigationDelegate, getOrientation } from './utils';

import {
  View,
  TouchableOpacity,
  Navigator,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

const IS_IOS = Platform.OS === 'ios';

const NAV_BAR_STYLES = Navigator.NavigationBar.Styles;
const NAV_BAR_DEFAULT_BACKGROUND_COLOR = 'white';
const NAV_BAR_DEFAULT_TINT_COLOR = 'black';
const NAV_HEIGHT = NAV_BAR_STYLES.General.TotalNavHeight;
const SCREEN_WIDTH = Dimensions.get('window').width;
const NAVBAR_LANDSCAPE_HEIGHT_IOS = 32;
const NAVBAR_LANDSCAPE_HEIGHT_ANDROID = 40;
const DEFAULT_IOS_BACK_ICON = 'ios-arrow-back';
const DEFAULT_ANDROID_BACK_ICON = 'md-arrow-back';
const PADDING_HORIZONTAL = 10;

export default class NavBar extends React.Component {
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

  constructor(props) {
    super(props);

    this.state = {
      animationProgress: new Animated.Value(0),
      animationFromIndex: 0,
      animationToIndex: 0,
      navBarOpacity: new Animated.Value(props.isHiddenOnInit ? 0 : 1),
      navBarYPos: new Animated.Value(props.isHiddenOnInit ? -NAV_HEIGHT : 0),
      navBarWidth: SCREEN_WIDTH,
      navBarHeight: getOrientation() === 'PORTRAIT' ? NAV_HEIGHT :
        (IS_IOS ? NAVBAR_LANDSCAPE_HEIGHT_IOS : NAVBAR_LANDSCAPE_HEIGHT_ANDROID),
      prevLeftPartWidth: null,
      leftPartWidth: 0,
      prevRightPartWidth: null,
      rightPartWidth: 0,
      prevTitleXPos: 0,
      prevTitleWidth: 0,
      backIconWidth: 0,
    };
  }

  _setTitle(title) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const routeProps = currentRoute.props || {}; // eslint-disable-line no-unused-vars

    if (navigationDelegate) {
      navigationDelegate.renderTitle = (routeProps) => title; // eslint-disable-line no-unused-vars
    }
  }

  _setLeftPart(part) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const routeProps = currentRoute.props || {}; // eslint-disable-line no-unused-vars

    if (navigationDelegate) {
      navigationDelegate.renderNavBarLeftPart = (routeProps) => part; // eslint-disable-line no-unused-vars
    }
  }

  _setRightPart(part) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const routeProps = currentRoute.props || {}; // eslint-disable-line no-unused-vars

    if (navigationDelegate) {
      navigationDelegate.renderNavBarRightPart = (routeProps) => part; // eslint-disable-line no-unused-vars
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
    });

    this.state.animationProgress.setValue(progress);

    this.forceUpdate();
  }

  immediatelyRefresh() {
    this.setState({
      animationProgress: new Animated.Value(0),
      animationFromIndex: 0,
      animationToIndex: 0,
      navBarOpacity: new Animated.Value(this.props.isHiddenOnInit ? 0 : 1),
      navBarYPos: new Animated.Value(this.props.isHiddenOnInit ? -NAV_HEIGHT : 0),
      prevLeftPartWidth: null,
      leftPartWidth: 0,
      prevRightPartWidth: null,
      rightPartWidth: 0,
      prevTitleXPos: 0,
      prevTitleWidth: 0,
      backIconWidth: 0,
    });
  }

  show(type = 'fade') {
    if (type === 'fade') {
      this.state.navBarYPos.setValue(0);

      Animated.timing(this.state.navBarOpacity, {
        toValue: 1,
        duration: 200,
      }).start();
    } else if (type === 'slide') {
      this.state.navBarOpacity.setValue(1);

      Animated.timing(this.state.navBarYPos, {
        toValue: 0,
        duration: 100,
      }).start();
    }
  }

  hide(type = 'fade') {
    if (type === 'fade') {
      Animated.timing(this.state.navBarOpacity, {
        toValue: 0,
        duration: 200,
      }).start(() => {
        this.state.navBarYPos.setValue(-NAV_HEIGHT);
      });
    } else if (type === 'slide') {
      Animated.timing(this.state.navBarYPos, {
        toValue: -NAV_HEIGHT,
        duration: 100,
      }).start(() => {
        this.state.navBarOpacity.setValue(0);
      });
    }
  }

  _onPrevLeftPartLayout = (e) => {
    this.setState({
      prevLeftPartWidth: e.nativeEvent.layout.width,
    });
  };

  _onLeftPartLayout = (e) => {
    this.setState({
      leftPartWidth: e.nativeEvent.layout.width,
    });
  };

  _onPrevRightPartLayout = (e) => {
    this.setState({
      prevRightPartWidth: e.nativeEvent.layout.width,
    });
  };

  _onRightPartLayout = (e) => {
    this.setState({
      rightPartWidth: e.nativeEvent.layout.width,
    });
  };

  _onPrevTitleLayout = (e) => {
    const { layout } = e.nativeEvent;

    this.setState({
      prevTitleWidth: layout.width,
      prevTitleXPos: layout.x,
    });
  };

  _onBackIconLayout = (e) => {
    const { layout } = e.nativeEvent;
    this.setState({
      backIconWidth: layout.width,
    });
  };

  _onNavBarLayout = (e) => {
    const { layout } = e.nativeEvent;

    this.setState({
      navBarWidth: layout.width,
      navBarHeight: getOrientation() === 'PORTRAIT' ? NAV_HEIGHT :
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
      animationProgress,
      navBarYPos,
      navBarOpacity,
      navBarWidth,
      navBarHeight,
      prevTitleXPos,
      prevTitleWidth,
      backIconWidth,
    } = this.state;

    let {
      prevLeftPartWidth,
      leftPartWidth,
      prevRightPartWidth,
      rightPartWidth,
    } = this.state;

    let {
      animationToIndex,
      animationFromIndex,
    } = this.state;

    if (animationToIndex === 0 && animationFromIndex === 0) {
      animationToIndex = navState.presentedIndex;
      animationFromIndex = navState.presentedIndex;
    }

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
      });
    } else {
      underlay = null;
    }

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

    let prevLeftPart =
      prevRoute && routeMapper.LeftPart(
        prevRoute || route,
        navigator,
        isGoingBack ? animationToIndex  : animationFromIndex,
        navState
      ) || null;

    let leftPart =
      route && routeMapper.LeftPart(
        route || prevRoute,
        navigator,
        isGoingBack ? animationFromIndex : animationToIndex,
        navState
      ) || null;

    prevLeftPartWidth = prevLeftPart ? prevLeftPartWidth : 0;
    leftPartWidth = leftPart ? leftPartWidth : 0;

    let backBtn;
    let prevBackBtn;

    const backIconName = IS_IOS ?
      DEFAULT_IOS_BACK_ICON :
      DEFAULT_ANDROID_BACK_ICON;

    const backIconSize = IS_IOS ?
      (getOrientation() === 'PORTRAIT' ? 32 : 26) :
      24;

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
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={prevLeftPart.onPress}
            hitSlop={{
              left: 10,
              top: 0,
              right: 10,
              bottom: 0,
            }}
          >
            {backIcon ||
              <Ionicon
                style={styles.backBtnIcon}
                onLayout={this._onBackIconLayout}
                name={backIconName}
                size={backIconSize}
                color={
                  prevLeftPart.textStyle.color ||
                  NAV_BAR_DEFAULT_TINT_COLOR}
              />
            }
            {IS_IOS &&
              <Animated.Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.backBtnText,
                  prevLeftPart.textStyle,
                  {
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ? [-leftPartWidth, 0] : [0, -leftPartWidth],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {prevLeftPart.text}
              </Animated.Text>
            }
          </TouchableOpacity>
        </Animated.View>
      );

      prevLeftPart = null;
    }

    if (leftPart && leftPart.isBackBtn) {
      backBtn = (
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              opacity: animationProgress.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: isGoingBack ? [1, 0, 0] : [0, 1, 1],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={leftPart.onPress}
            hitSlop={{
              left: 10,
              top: 0,
              right: 10,
              bottom: 0,
            }}
          >
            {backIcon ||
              <Ionicon
                style={styles.backBtnIcon}
                onLayout={this._onBackIconLayout}
                name={backIconName}
                size={backIconSize}
                color={
                  leftPart.textStyle.color ||
                  NAV_BAR_DEFAULT_TINT_COLOR}
              />
            }
            {IS_IOS &&
              <Animated.Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.backBtnText,
                  leftPart.textStyle,
                  {
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ?
                          [
                            0,
                            prevTitleXPos -
                            (PADDING_HORIZONTAL + (style.paddingHorizontal || 0) + backIconWidth),
                          ] :
                          [
                            prevTitleXPos -
                            (PADDING_HORIZONTAL + (style.paddingHorizontal || 0) + backIconWidth),
                            0,
                          ],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {leftPart.text}
              </Animated.Text>
            }
          </TouchableOpacity>
        </Animated.View>
      );

      leftPart = null;
    }

    const prevRightPart =
      prevRoute && routeMapper.RightPart((prevRoute || route), navigator) || null;
    const rightPart =
      route && routeMapper.RightPart((route || prevRoute), navigator) || null;

    prevRightPartWidth = prevRightPart ? prevRightPartWidth : 0;
    rightPartWidth = rightPart ? rightPartWidth : 0;

    const prevTitlePartWidth =
      navBarWidth - (prevLeftPartWidth + prevRightPartWidth + (style.paddingHorizontal || 0));

    const prevTitlePart = prevTitle ?
      (<View
        style={styles.titlePart}
        pointerEvents={'box-none'}
      >
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              paddingHorizontal: IS_IOS ?
                Math.max(prevLeftPartWidth, prevRightPartWidth) +
                (style.paddingHorizontal || 0) :
                0,
              alignItems: IS_IOS ? 'center' : 'flex-start',
              transform: [
                {
                  translateX: IS_IOS ? animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange:
                      isGoingBack ?
                      [
                        prevTitlePartWidth - prevTitleWidth > 0 ?
                          -((prevTitlePartWidth - prevTitleWidth) / 2) +
                           (style.paddingHorizontal || 0) + PADDING_HORIZONTAL + backIconWidth
                           : 0,
                        0,
                      ] :
                      [
                        0,
                        prevTitlePartWidth - prevTitleWidth > 0 ?
                          -((prevTitlePartWidth - prevTitleWidth) / 2) +
                           (style.paddingHorizontal || 0) + PADDING_HORIZONTAL + backIconWidth
                           : 0,
                      ],
                  }) : 0,
                },
                {
                  translateY: animationProgress.interpolate({
                    inputRange: [0, 0.999, 1],
                    outputRange:
                      isGoingBack ?
                        [0, 0, 0] :
                        [0, 0, -SCREEN_WIDTH],
                  }),
                },
              ],
              opacity: animationProgress.interpolate({
                inputRange: [0, 1],
                outputRange: isGoingBack ? [0, 1] : [1, 0],
              }),
            },
          ]}
        >
          <View
            onLayout={IS_IOS ? this._onPrevTitleLayout : null}
          >
            {prevTitle}
          </View>
        </Animated.View>
      </View>) :
      null;

    const titlePart = title && animationFromIndex !== animationToIndex ?
      (<View
        style={styles.titlePart}
        pointerEvents={'box-none'}
      >
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              paddingHorizontal: IS_IOS ?
                Math.max(leftPartWidth, rightPartWidth) +
                (style.paddingHorizontal || 0) :
                0,
              alignItems: IS_IOS ? 'center' : 'flex-start',
              transform: IS_IOS ? [
                {
                  translateX: animationProgress.interpolate({
                    inputRange: [0, 0.999, 1],
                    outputRange:
                      isGoingBack ?
                      [
                        0,
                        (navBarWidth / 2) + (navBarWidth * 0.2),
                        -SCREEN_WIDTH,
                      ] :
                      [
                        (navBarWidth / 2) + (navBarWidth * 0.2),
                        0,
                        0,
                      ],
                  }),
                },
              ] : [],
              opacity: animationProgress.interpolate({
                inputRange: [0, 0.66, 1],
                outputRange: isGoingBack ? [1, 0, 0] : [0, 0.2, 1],
              }),
            },
          ]}
        >
          {title}
        </Animated.View>
      </View>) :
      null;

    return (
      <Animated.View
        onLayout={this._onNavBarLayout}
        style={[
          style,
          styles.navBar,
          navBarBackgroundColorStyle,
          {
            height: navBarHeight,
            opacity: isGoingBack && prevRoute.component &&
                    getNavigationDelegate(prevRoute.component) &&
                    getNavigationDelegate(prevRoute.component).navBarIsHidden ?
              animationProgress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 0],
              }) :
              navBarOpacity,
            transform: [
              {
                translateY: navBarYPos,
              },
            ],
          },
        ]}
      >

        {navBarBackgroundColor !== 'transparent' ? underlay : null}

        <View // PREV LAYER
          style={[
            styles.layer,
            style.paddingHorizontal ? {
              paddingHorizontal: style.paddingHorizontal,
            } : {},
          ]}
          pointerEvents={'box-none'}
        >
          {IS_IOS && prevTitlePart}
          {prevLeftPart || prevBackBtn ?
            <View
              style={styles.leftPartContainer}
              pointerEvents={'box-none'}
              onLayout={IS_IOS ? this._onPrevLeftPartLayout : null}
            >
              {prevLeftPart ?
                <Animated.View
                  style={[
                    styles.animatedWrapper,
                    {
                      alignItems: 'flex-start',
                      opacity: animationProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: isGoingBack ? [0, 1] : [1, 0],
                      }),
                      transform: [
                        {
                          translateY: animationProgress.interpolate({
                            inputRange: [0, 0.999, 1],
                            outputRange:
                              isGoingBack ?
                               [0, 0, 0] :
                               [0, 0, -SCREEN_WIDTH],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {prevLeftPart}
                </Animated.View> :
                null
              }
              {prevBackBtn}
            </View> :
            null
          }
          {!IS_IOS && prevTitlePart}
          {prevRightPart ?
            <View
              style={styles.rightPartContainer}
              pointerEvents={'box-none'}
              onLayout={IS_IOS ? this._onPrevRightPartLayout : null}
            >
              <Animated.View
                style={[
                  styles.animatedWrapper,
                  {
                    alignItems: 'flex-end',
                    opacity: animationProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: isGoingBack ? [0, 1] : [1, 0],
                    }),
                    transform: [
                      {
                        translateY: animationProgress.interpolate({
                          inputRange: [0, 0.999, 1],
                          outputRange:
                            isGoingBack ?
                              [0, 0, 0] :
                              [0, 0, -SCREEN_WIDTH],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {prevRightPart}
              </Animated.View>
            </View> :
          null
         }
        </View>

        <View // LAYER
          style={[
            styles.layer,
            style.paddingHorizontal ? {
              paddingHorizontal: style.paddingHorizontal,
            } : {},
          ]}
          pointerEvents={'box-none'}
        >
          {IS_IOS && titlePart}
          {(leftPart && animationFromIndex !== animationToIndex) || backBtn ?
            <View
              style={styles.leftPartContainer}
              pointerEvents={'box-none'}
              onLayout={IS_IOS ? this._onLeftPartLayout : null}
            >
              {leftPart && animationFromIndex !== animationToIndex ?
                <Animated.View
                  style={[
                    styles.animatedWrapper,
                    {
                      alignItems: 'flex-start',
                      opacity: animationProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: isGoingBack ? [1, 0] : [0, 1],
                      }),
                    },
                  ]}
                >
                  {leftPart}
                </Animated.View> :
                null
              }
              {backBtn}
            </View> :
            null
          }
          {!IS_IOS && titlePart}
          {rightPart && animationFromIndex !== animationToIndex ?
            <View
              style={styles.rightPartContainer}
              pointerEvents={'box-none'}
              onLayout={IS_IOS ? this._onRightPartLayout : null}
            >
              <Animated.View
                style={[
                  styles.animatedWrapper,
                  {
                    alignItems: 'flex-end',
                    opacity: animationProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: isGoingBack ? [1, 0] : [0, 1],
                    }),
                  },
                ]}
              >
                {rightPart}
              </Animated.View>
            </View> :
            null
          }
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    flexDirection: 'row',
  },
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    marginTop: getOrientation() === 'PORTRAIT' ?
      NAV_BAR_STYLES.General.StatusBarHeight :
      0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  animatedWrapper: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  leftPartContainer: {
    paddingLeft: PADDING_HORIZONTAL,
  },
  titlePart: IS_IOS ? {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  } : {
    flex: 1,
    paddingLeft: 10,
  },
  rightPartContainer: {
    paddingRight: PADDING_HORIZONTAL,
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: IS_IOS ? 'flex-start' : 'center',
  },
  backBtnText: {
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
  },
  backBtnIcon: {
    top: 1,
  },
});
