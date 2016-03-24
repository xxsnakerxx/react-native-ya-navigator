import React from 'react-native';

const {
  View,
  Navigator,
  Animated,
  StyleSheet,
  PropTypes,
} = React;

const AnimatedNavBar = Animated.createAnimatedComponent(Navigator.NavigationBar);
const NAV_HEIGHT = Navigator.NavigationBar.Styles.General.TotalNavHeight;

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      opacity: new Animated.Value(props.isHiddenOnInit ? 0 : 1),
      y: props.isHiddenOnInit ? -NAV_HEIGHT : 0,
    }
  }

  setTitle(title) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];
    const oldTitle =
      currentRoute.component.navigationDelegate &&
      currentRoute.component.navigationDelegate.getNavBarTitle &&
      currentRoute.component.navigationDelegate.getNavBarTitle();

    if (oldTitle) {
      let newTitle = null;

      if (typeof oldTitle === 'object') {
        if (React.isValidElement(oldTitle)) {
          newTitle = React.cloneElement(oldTitle, {
            text: title,
            title,
          });

          currentRoute.component.navigationDelegate
            .getNavBarTitle = () => newTitle;
        } else {
          currentRoute.component.navigationDelegate
            .getNavBarTitle = () => Object.assign({}, oldTitle, {
              text: title,
            });
        }
      }

      this.forceUpdate();
    } else {
      if (currentRoute.component.navigationDelegate) {
        currentRoute.component.navigationDelegate.getNavBarTitle = () => title;

        this.forceUpdate();
      }
    }
  }

  setLeftBtn(btn) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];

    if (currentRoute.component.navigationDelegate) {
      currentRoute.component.navigationDelegate.getNavBarLeftBtn = () => btn;

      this.forceUpdate();
    }
  }

  setRightBtn(btn) {
    const currentRoute = this.props.navState.routeStack.slice(-1)[0];

    if (currentRoute.component.navigationDelegate) {
      currentRoute.component.navigationDelegate.getNavBarRightBtn = () => btn;

      this.forceUpdate();
    }
  }

  updateProgress() {
    this.refs.animatedNavBar
    .refs.node.updateProgress(...arguments);
  }

  show() {
    this.setState({
      y: 0,
    })
    Animated.timing(this.state.opacity, {
      toValue: 1,
    }).start();
  }

  hide() {
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: 100,
    }).start(() => {
      this.setState({
        y: -NAV_HEIGHT,
      })
    });
  }

  render() {
    return (
      <AnimatedNavBar
        ref='animatedNavBar'
        {...this.props}
        style={[this.props.style,
          {
            opacity: this.state.opacity,
            transform: [
              {
                translateY: this.state.y,
              },
            ],
          },
        ]}/>
    )
  }

  static propTypes = {
    navState: Navigator.NavigationBar.propTypes.navState,
    style: View.propTypes.style,
    isHiddenOnInit: PropTypes.bool,
  };
}
