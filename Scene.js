import React from 'react-native';

import * as constants from './constants';

const {
  View,
  Navigator,
  StyleSheet,
  PropTypes,
} = React;

export default class Scene extends React.Component {
  componentDidMount() {
    const { delegate } = this.props;

    if (delegate &&
        delegate.constructor.navigationDelegate &&
        delegate.constructor.navigationDelegate.id) {

      const navigationDelegateCopy = Object.assign({}, delegate.constructor.navigationDelegate);

      const navigationContext = delegate.props.navigator.navigationContext;
      const delegateId = delegate.constructor.navigationDelegate.id;

      this._onTitlePressSub = navigationContext.addListener(
        constants.TITLE_PRESS_EVENT,
        ({data: {route}}) => {
          delegateId ===
          route.component.navigationDelegate.id ?
            (delegate.onNavBarTitlePress ? delegate.onNavBarTitlePress() : () => {}) :
            null
        }
      );

      this._onLeftBtnPressSub = navigationContext.addListener(
        constants.LEFT_BTN_PRESS_EVENT,
        ({data: {route}}) => {
          delegateId ===
          route.component.navigationDelegate.id ?
            (delegate.onNavBarLeftBtnPress ? delegate.onNavBarLeftBtnPress() : () => {}) :
            null
        }
      );

      this._onRightBtnPressSub = navigationContext.addListener(
        constants.RIGHT_BTN_PRESS_EVENT,
        ({data: {route}}) => {
          delegateId ===
          route.component.navigationDelegate.id ?
            (delegate.onNavBarRightBtnPress ? delegate.onNavBarRightBtnPress() : () => {}) :
            null
        }
      );

      const delegateUnmountHandler = delegate.componentWillUnmount;

      delegate.componentWillUnmount = () => {
        delegateUnmountHandler && delegateUnmountHandler.bind(delegate)()

        this._removeSubs();

        // restore here because we might change it by navBar.setTitle etc...
        delegate.constructor.navigationDelegate = navigationDelegateCopy;
      }
    }
  }

  _removeSubs() {
    const { delegate } = this.props;

    if (delegate) {
      this._onTitlePressSub.remove();
      this._onLeftBtnPressSub.remove();
      this._onRightBtnPressSub.remove();
    }
  }

  render() {
    return (
      <View
        style={[
          {
            flex: 1,
            paddingTop: this.props.paddingTop ?
              Scene.navBarHeight :
              0,
          },
          this.props.style,
        ]}>
          {this.props.children}
        </View>
    )
  }

  static propTypes = {
    style: View.propTypes.style,
    paddingTop: PropTypes.bool,
    delegate: (props, propName) => {
      if (props[propName] && !(props[propName] instanceof React.Component)) {
        return new Error('Scene delegate should be instance of React.Component');
      }
    },
  };

  static defaultProps = {
    paddingTop: true,
  };

  static navBarHeight = Navigator.NavigationBar.Styles.General.TotalNavHeight;
}
