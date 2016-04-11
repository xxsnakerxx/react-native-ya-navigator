import React from 'react-native';

import Ionicon from 'react-native-vector-icons/Ionicons'

import { getNavigationDelegate } from './utils';

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
const LEFT_PART_WIDTH = IS_IOS ? SCREEN_WIDTH / 4 : 48;
const RIGHT_PART_WIDTH = SCREEN_WIDTH / (IS_IOS ? 4 : 3);
const TITLE_PART_WIDTH = SCREEN_WIDTH - LEFT_PART_WIDTH - RIGHT_PART_WIDTH;
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
    }
  }

  _setTitle(title) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);
    const oldTitle =
      navigationDelegate &&
      navigationDelegate.getNavBarTitle &&
      navigationDelegate.getNavBarTitle();

    if (oldTitle) {
      let newTitle = null;

      if (typeof oldTitle === 'object') {
        if (React.isValidElement(oldTitle)) {
          newTitle = React.cloneElement(oldTitle, {
            text: title,
            title,
          });

          navigationDelegate
            .getNavBarTitle = () => newTitle;
        } else {
          navigationDelegate
            .getNavBarTitle = () => Object.assign({}, oldTitle, {
              text: title,
            });
        }
      }
    } else {
      if (navigationDelegate) {
        navigationDelegate.getNavBarTitle = () => title;
      }
    }
  }

  _setLeftBtn(btn) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);

    if (navigationDelegate) {
      navigationDelegate.getNavBarLeftBtn = () => btn;
    }
  }

  _setRightBtn(btn) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const navigationDelegate = getNavigationDelegate(currentRoute.component);

    if (navigationDelegate) {
      navigationDelegate.getNavBarRightBtn = () => btn;
    }
  }

  updateUI(ui) {
    ui.title !== undefined && this._setTitle(ui.title);
    ui.leftBtn !== undefined && this._setLeftBtn(ui.leftBtn);
    ui.rightBtn !== undefined && this._setRightBtn(ui.rightBtn);

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
      prevTitleXPos,
      prevTitleWidth,
      backIconWidth,
    } = this.state;

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

    const navBarBackgroundColorStyle = {
      backgroundColor: animationProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [prevNavBarBackgroundColor, navBarBackgroundColor],
        extrapolate: false,
      }),
    };

    const isGoingBack = animationToIndex < animationFromIndex;

    const route =
      navState.routeStack[isGoingBack ? animationFromIndex : animationToIndex];
    const prevRoute =
      navState.routeStack[isGoingBack ? animationToIndex : animationFromIndex];

    let title = route && routeMapper.Title(route || prevRoute) || null;
    const prevTitle = prevRoute && routeMapper.Title(prevRoute || route) || null;

    let leftBtn =
      route && routeMapper.LeftButton(
        route || prevRoute,
        navigator,
        isGoingBack ? animationFromIndex : animationToIndex,
        navState
      ) || null;

    let prevLeftBtn =
      prevRoute && routeMapper.LeftButton(
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

    const backIconSize = IS_IOS ? 32 : 24;

    if (leftBtn && leftBtn.isBackBtn) {
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
            onPress={navigator.pop}>
            {backIcon ||
              <Ionicon
                style={styles.backBtnIcon}
                onLayout={this._onBackIconLayout}
                name={backIconName}
                size={backIconSize}
                color={
                  leftBtn.textStyle &&
                  leftBtn.textStyle.color ||
                  NAV_BAR_DEFAULT_TINT_COLOR} />
            }
            {IS_IOS &&
              <Animated.Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.backBtnText,
                  leftBtn.textStyle,
                  {
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ?
                            [2, LEFT_PART_WIDTH + prevTitleXPos - (backIconWidth + 10 + 2)] :
                            [LEFT_PART_WIDTH + prevTitleXPos - (backIconWidth + 10 + 2), 2],
                        }),
                      },
                    ],
                  },
                ]}>
                {leftBtn.text}
              </Animated.Text>
            }
          </TouchableOpacity>
        </Animated.View>
      )

      leftBtn = null;
    }

    if (prevLeftBtn && prevLeftBtn.isBackBtn) {
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
            onPress={navigator.pop}>
            {backIcon ||
              <Ionicon
                style={styles.backBtnIcon}
                onLayout={this._onBackIconLayout}
                name={backIconName}
                size={backIconSize}
                color={
                  prevLeftBtn.textStyle &&
                  prevLeftBtn.textStyle.color ||
                  NAV_BAR_DEFAULT_TINT_COLOR} />
            }
            {IS_IOS &&
              <Animated.Text
                numberOfLines={1}
                allowFontScaling={false}
                style={[
                  styles.backBtnText,
                  prevLeftBtn.textStyle,
                  {
                    transform: [
                      {
                        translateX: animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: isGoingBack ? [-LEFT_PART_WIDTH, 2] : [2, -LEFT_PART_WIDTH / 2],
                        }),
                      },
                    ],
                  },
                ]}>
                {prevLeftBtn.text}
              </Animated.Text>
            }
          </TouchableOpacity>
        </Animated.View>
      )

      prevLeftBtn = null;
    }

    let rightBtn = route && routeMapper.RightButton(route || prevRoute) || null;
    let prevRightBtn = prevRoute && routeMapper.RightButton(prevRoute || route) || null;

    return (
      <Animated.View
        style={[
          style,
          styles.navBar,
          navBarBackgroundColorStyle,
          {
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

        <View
          style={styles.titleContainer}>
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
                            [-(LEFT_PART_WIDTH + ((TITLE_PART_WIDTH - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2), 0] :
                            [0, -(LEFT_PART_WIDTH + ((TITLE_PART_WIDTH - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2)],
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
              {IS_IOS ?
                <View onLayout={this._onPrevTitleLayout}>
                  {prevTitle}
                </View> :
                prevTitle
              }
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
                            [0, (LEFT_PART_WIDTH + ((TITLE_PART_WIDTH - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2)] :
                            [(LEFT_PART_WIDTH + ((TITLE_PART_WIDTH - prevTitleWidth) / 2)) + (backIconWidth + 10 + 2), 0],
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
              {title}
            </Animated.View>
        </View>

        <View
          style={styles.navBarLeftPartContainer}>
          {prevLeftBtn ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  justifyContent: 'flex-start',
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [0, 1] : [1, 0],
                  }),
                },
              ]}
            >
              {prevLeftBtn}
            </Animated.View> :
            null
          }
          {leftBtn && animationFromIndex !== animationToIndex ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  justifyContent: 'flex-start',
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [1, 0] : [0, 1],
                  }),
                },
              ]}
            >
              {leftBtn}
            </Animated.View> :
            null
          }
          {backBtn}
          {prevBackBtn}
        </View>

        <View
          style={styles.navBarRightPartContainer}>
          {prevRightBtn ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  justifyContent: 'flex-end',
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [0, 1] : [1, 0],
                  }),
                },
              ]}
            >
              {prevRightBtn}
            </Animated.View> :
            null
          }
          {rightBtn && animationFromIndex !== animationToIndex ?
            <Animated.View
              style={[
                styles.animatedWrapper,
                {
                  justifyContent: 'flex-end',
                  opacity: animationProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: isGoingBack ? [1, 0] : [0, 1],
                  }),
                },
              ]}
            >
              {rightBtn}
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
      LeftButton: PropTypes.func.isRequired,
      RightButton: PropTypes.func.isRequired,
      navBarBackgroundColor: PropTypes.func.isRequired,
    }).isRequired,
    backIcon: PropTypes.object,
  };
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SCREEN_WIDTH,
    height: NAV_BAR_STYLES.General.TotalNavHeight,
    paddingTop: NAV_BAR_STYLES.General.StatusBarHeight,
    flexDirection: 'row',
  },
  titleContainer: {
    position: 'absolute',
    left: IS_IOS ? (SCREEN_WIDTH - TITLE_PART_WIDTH) / 2 : LEFT_PART_WIDTH + 10,
    width: TITLE_PART_WIDTH,
    height: NAV_BAR_STYLES.General.NavBarHeight,
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
  },
  navBarLeftPartContainer: {
    position: 'absolute',
    left: 10,
    width: LEFT_PART_WIDTH,
    height: NAV_BAR_STYLES.General.NavBarHeight,
  },
  navBarRightPartContainer: {
    position: 'absolute',
    right: 10,
    width: RIGHT_PART_WIDTH,
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
