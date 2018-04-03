import React from 'react';
import PropTypes from 'prop-types';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { getNavigationOption, getOrientation, isIphoneX } from './utils';
import FBNavigator from './FBNavigator';

import {
  View,
  ViewPropTypes,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';

const IS_IOS = Platform.OS === 'ios';

const NAV_BAR_STYLES = {
  ...FBNavigator.NavigationBar.Styles,
  General: {
    ...FBNavigator.NavigationBar.Styles.General,
    ...(isIphoneX() ? { StatusBarHeight: 44 } : {}),
    ...(isIphoneX() ? { TotalNavHeight: FBNavigator.NavigationBar.Styles.General.NavBarHeight + 44 } : {}),
  },
};
const NAV_BAR_DEFAULT_BACKGROUND_COLOR = 'white';
const NAV_BAR_DEFAULT_TINT_COLOR = 'black';
const NAV_HEIGHT = NAV_BAR_STYLES.General.TotalNavHeight;
const SCREEN_WIDTH = Dimensions.get('window').width;
const NAVBAR_LANDSCAPE_HEIGHT_IOS = 32;
const NAVBAR_LANDSCAPE_HEIGHT_ANDROID = 40;
const DEFAULT_IOS_BACK_ICON = 'ios-arrow-back';
const DEFAULT_ANDROID_BACK_ICON = 'md-arrow-back';
const PADDING_HORIZONTAL = 10;

const BACK_ICON_NAME = IS_IOS ? DEFAULT_IOS_BACK_ICON : DEFAULT_ANDROID_BACK_ICON;

export default class NavBar extends React.Component {
  static propTypes = {
    style: ViewPropTypes.style,
    isHiddenOnInit: PropTypes.bool,
    fixedHeight: PropTypes.number,
    navState: FBNavigator.NavigationBar.propTypes.navState,
    routeMapper: PropTypes.shape({
      Title: PropTypes.func.isRequired,
      LeftPart: PropTypes.func.isRequired,
      RightPart: PropTypes.func.isRequired,
      navBarBackgroundColor: PropTypes.func.isRequired,
    }).isRequired,
    underlay: PropTypes.object,
    backIcon: PropTypes.object,
    backIconWidth: PropTypes.number,
    crossPlatformUI: PropTypes.bool,
  }

  static defaultProps = {
    style: null,
    isHiddenOnInit: false,
    fixedHeight: 0,
    underlay: null,
    backIcon: null,
    backIconWidth: 0,
    crossPlatformUI: false,
  }

  constructor(props) {
    super(props);

    this.state = {
      animationProgress: new Animated.Value(0),
      animationFromIndex: 0,
      animationToIndex: 0,
      navBarOpacity: new Animated.Value(props.isHiddenOnInit ? 0 : 1),
      navBarYPos: new Animated.Value(0),
      navBarWidth: SCREEN_WIDTH,
      navBarHeight: getOrientation() === 'PORTRAIT' ? NAV_HEIGHT :
        (IS_IOS ? NAVBAR_LANDSCAPE_HEIGHT_IOS : NAVBAR_LANDSCAPE_HEIGHT_ANDROID),
      layouts: [],
    };
  }

  updateProgress(progress, fromIndex, toIndex) {
    this.setState({
      animationFromIndex: fromIndex,
      animationToIndex: toIndex,
    });

    this.state.animationProgress.setValue(progress);
  }

  immediatelyRefresh() {
    this.setState({
      animationProgress: new Animated.Value(0),
      animationFromIndex: 0,
      animationToIndex: 0,
      navBarOpacity: new Animated.Value(this.props.isHiddenOnInit ? 0 : 1),
      navBarYPos: new Animated.Value(0),
      layouts: [],
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

  _onLeftPartLayout = (e, index) => {
    const { layout } = e.nativeEvent;
    const layouts = this.state.layouts.slice();

    layouts[index] = {
      ...layouts[index],
      leftPartWidth: layout.width,
    };

    this.setState({
      layouts,
    });
  }

  _onRightPartLayout = (e, index) => {
    const { layout } = e.nativeEvent;
    const layouts = this.state.layouts.slice();

    layouts[index] = {
      ...layouts[index],
      rightPartWidth: layout.width,
    };

    this.setState({
      layouts,
    });
  }

  _onTitleLayout = (e, index) => {
    const { layout } = e.nativeEvent;
    const layouts = this.state.layouts.slice();

    layouts[index] = {
      ...layouts[index],
      titleWidth: layout.width,
      titleXPos: layout.x,
    }

    this.setState({
      layouts,
    });
  }

  _onBackIconLayout = (e, index) => {
    const { layout } = e.nativeEvent;
    const layouts = this.state.layouts.slice();

    layouts[index] = {
      ...layouts[index],
      backIconWidth: layout.width,
    };

    this.setState({
      layouts,
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
      fixedHeight,
      crossPlatformUI,
      isHiddenOnInit,
      backIcon,
    } = this.props;

    const backIconWidthFromProps = this.props.backIconWidth;

    const {
      animationProgress,
      navBarYPos,
      navBarWidth,
      navBarHeight,
      animationToIndex,
      animationFromIndex,
      layouts,
    } = this.state;

    let { navBarOpacity } = this.state;

    let { underlay } = this.props;

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

    const paddingHorizontal = (style && style.paddingHorizontal) || 0;

    const { routeStack } = navState;

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

    const routeNavBarIsHidden = getNavigationOption(route, 'navBarIsHidden');
    const prevRouteNavBarIsHidden = getNavigationOption(prevRoute, 'navBarIsHidden');

    const shouldAnimateNavBarParts = IS_IOS &&
      !((!isGoingBack && routeNavBarIsHidden || isGoingBack && prevRouteNavBarIsHidden) ||
      (isGoingBack && routeNavBarIsHidden || !isGoingBack && prevRouteNavBarIsHidden));

    if (animationToIndex === animationFromIndex &&
      animationFromIndex === 0 &&
      isHiddenOnInit) {
      navBarOpacity._updateValue(0);
    } else if (!isGoingBack && routeNavBarIsHidden || isGoingBack && prevRouteNavBarIsHidden) {
      navBarOpacity = animationProgress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
      });
    } else if (isGoingBack && routeNavBarIsHidden || !isGoingBack && prevRouteNavBarIsHidden) {
      navBarOpacity = animationProgress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
      });
    } else {
      navBarOpacity._updateValue(1);
    }

    return (
      <Animated.View
        onLayout={this._onNavBarLayout}
        pointerEvents={navBarOpacity.__getValue() === 0 ? 'box-none' : undefined}
        style={[
          style,
          styles.navBar,
          navBarBackgroundColorStyle,
          {
            height: !fixedHeight ? navBarHeight : fixedHeight,
            opacity: navBarOpacity,
            transform: [
              {
                translateY: navBarYPos,
              },
            ],
          },
        ]}
      >

        {navBarBackgroundColor !== 'transparent' ? underlay : null}

        {navState.routeStack.map((route, index) => {
          const isCurrentRoute = (isGoingBack ? animationFromIndex : animationToIndex) === index ||
            animationFromIndex === animationToIndex;
          const isPrevRoute = (isGoingBack ? animationToIndex : animationFromIndex) === index;

          const prevIndex = isGoingBack ? animationToIndex : animationFromIndex;

          const prevTitleXPos = (layouts[prevIndex] && layouts[prevIndex].titleXPos) || 0;
          const backIconWidth = (layouts[index] && layouts[index].backIconWidth) || backIconWidthFromProps;
          const leftPartWidth = (layouts[index] && layouts[index].leftPartWidth) || 0;
          const rightPartWidth = (layouts[index] && layouts[index].rightPartWidth) || 0;
          const prevLeftPartWidth = (layouts[prevIndex] && layouts[prevIndex].leftPartWidth) || 0;
          const prevRightPartWidth = (layouts[prevIndex] && layouts[prevIndex].rightPartWidth) || 0;
          const prevTitlePartWidth =
            navBarWidth - (prevLeftPartWidth + prevRightPartWidth + paddingHorizontal);
          const prevTitleWidth = (layouts[prevIndex] && layouts[prevIndex].titleWidth) || 0;

          let leftPart =
            route && routeMapper.LeftPart(
              route,
              navigator,
              index,
              navState,
            ) || null;

          const BACK_ICON_SIZE = IS_IOS ?
            (getOrientation() === 'PORTRAIT' ? 32 : 26) :
            24;

          let backBtn = null;

          if (leftPart && leftPart.isBackBtn) {
            backBtn = (
              <Animated.View
                style={[
                  styles.animatedWrapper,
                  isCurrentRoute ? {
                    opacity: animationProgress.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: isGoingBack ? [1, 0, 0] : [0, 1, 1],
                    }),
                  } : null,
                  isPrevRoute ? {
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 0.999, 1],
                          outputRange: isGoingBack ? [0, 0, 0] : [0, -SCREEN_WIDTH, -SCREEN_WIDTH],
                        }),
                      },
                    ],
                  } : null,
                  isPrevRoute ? {
                    opacity: animationProgress.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: isGoingBack ? [0, 1, 1] : [1, 0, 0],
                    }),
                  } : null,
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
                      onLayout={e => this._onBackIconLayout(e, index)}
                      name={BACK_ICON_NAME}
                      size={BACK_ICON_SIZE}
                      color={
                        leftPart.textStyle.color ||
                        NAV_BAR_DEFAULT_TINT_COLOR
                      }
                    />
                  }
                  {IS_IOS &&
                    <Animated.Text
                      numberOfLines={1}
                      allowFontScaling={false}
                      style={[
                        styles.backBtnText,
                        leftPart.textStyle,
                        isCurrentRoute && shouldAnimateNavBarParts ? {
                          transform: [
                            {
                              translateX: animationProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: isGoingBack ?
                                [
                                  0,
                                  prevTitleXPos -
                                  (PADDING_HORIZONTAL + paddingHorizontal + backIconWidth),
                                ] :
                                [
                                  prevTitleXPos -
                                  (PADDING_HORIZONTAL + paddingHorizontal + backIconWidth),
                                  0,
                                ],
                              }),
                            },
                          ],
                        } : null,
                        isPrevRoute && shouldAnimateNavBarParts ? {
                          transform: [
                            {
                              translateX: animationProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: isGoingBack ? [-leftPartWidth, 0] : [0, -leftPartWidth],
                              }),
                            },
                          ],
                        } : null,
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

          const rightPart = route && routeMapper.RightPart(route, navigator) || null;
          const title = route && routeMapper.Title(route, navigator) || null;

          const titlePart = title ? (
            <View
              style={(crossPlatformUI || IS_IOS) ? styles.titlePart_ios : styles.titlePart_android}
              pointerEvents="box-none"
            >
              <Animated.View
                style={[
                  styles.animatedWrapper,
                  {
                    paddingHorizontal: (crossPlatformUI || IS_IOS) ?
                      Math.max(leftPartWidth, rightPartWidth) + paddingHorizontal:
                      0,
                    alignItems: (crossPlatformUI || IS_IOS) ? 'center' : 'flex-start',
                  },
                  isCurrentRoute && shouldAnimateNavBarParts ? {
                    transform: [
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
                    ],
                  } : null,
                  isCurrentRoute ? {
                    opacity: animationProgress.interpolate({
                      inputRange: [0, 0.66, 1],
                      outputRange: isGoingBack ? [1, 0, 0] : [0, 0.2, 1],
                    }),
                  } : null,
                  isPrevRoute ? {
                    transform: [
                      {
                        translateX: shouldAnimateNavBarParts ? animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange:
                            isGoingBack ?
                            [
                              prevTitlePartWidth - prevTitleWidth > 0 ?
                                -(prevTitleXPos -
                                (PADDING_HORIZONTAL + paddingHorizontal + backIconWidth))
                                 : 0,
                              0,
                            ] :
                            [
                              0,
                              prevTitlePartWidth - prevTitleWidth > 0 ?
                                -(prevTitleXPos -
                                (PADDING_HORIZONTAL + paddingHorizontal + backIconWidth))
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
                  } : null,
                  isPrevRoute ? {
                    opacity: animationProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: isGoingBack ? [0, 1] : [1, 0],
                    }),
                  } : null,
                ]}
              >
                {/* for measuring title */}
                {(crossPlatformUI || IS_IOS) ?
                  <View
                    onLayout={e => this._onTitleLayout(e, index)}
                    pointerEvents="none"
                    style={{
                      opacity: 0,
                      position: 'absolute',
                    }}
                  >
                    {title}
                  </View> :
                  null
                }
                {title}
              </Animated.View>
            </View>) :
            null;

          return (
            <View
              key={route.__navigatorRouteID}
              style={[
                styles.layer,
                {
                  marginTop: getOrientation() === 'PORTRAIT' ?
                    NAV_BAR_STYLES.General.StatusBarHeight :
                    0,
                  paddingHorizontal:
                    (getOrientation() === 'LANDSCAPE' && isIphoneX() ? 44 : 0) +
                    (paddingHorizontal || 0),
                },
                fixedHeight ? { marginTop: 0 } : null,
                !isCurrentRoute && !isPrevRoute ? {
                  opacity: 0,
                } : null,
              ]}
              pointerEvents="box-none"
            >
              {(crossPlatformUI || IS_IOS) && titlePart}
              {leftPart || backBtn ?
                <View
                  style={styles.leftPartContainer}
                  pointerEvents="box-none"
                  onLayout={(crossPlatformUI || IS_IOS) ? (e => this._onLeftPartLayout(e, index)) : null}
                >
                  {leftPart ?
                    <Animated.View
                      style={[
                        styles.animatedWrapper,
                        {
                          alignItems: 'flex-start',
                        },
                        isCurrentRoute ? {
                          opacity: animationProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: isGoingBack ? [1, 0] : [0, 1],
                          }),
                        } : null,
                        isPrevRoute ? {
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
                        } : null,
                        isPrevRoute ? {
                          opacity: animationProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: isGoingBack ? [0, 1] : [1, 0],
                          }),
                        } : null,
                      ]}
                    >
                      {leftPart}
                    </Animated.View> :
                    null
                  }
                  {backBtn}
                </View> :
                <View />
              }
              {!(crossPlatformUI || IS_IOS) && titlePart}
              {rightPart ?
                <View
                  style={styles.rightPartContainer}
                  pointerEvents="box-none"
                  onLayout={(crossPlatformUI || IS_IOS) ? (e => this._onRightPartLayout(e, index)) : null}
                >
                  <Animated.View
                    style={[
                      styles.animatedWrapper,
                      {
                        alignItems: 'flex-end',
                      },
                      isCurrentRoute ? {
                        opacity: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ? [1, 0] : [0, 1],
                        }),
                      } : null,
                      isPrevRoute ? {
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
                      } : null,
                      isPrevRoute ? {
                        opacity: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ? [0, 1] : [1, 0],
                        }),
                      } : null,
                    ]}
                  >
                    {rightPart}
                  </Animated.View>
                </View> :
              null
             }
            </View>
          );
        })}
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
  titlePart_ios: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  titlePart_android: {
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
