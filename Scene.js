import React, { PropTypes } from 'react';

import {
  View,
  Navigator,
} from 'react-native';

export default class Scene extends React.Component {
  componentDidUpdate() {
    const { delegate } = this.props;

    if (delegate) {
      const navigationDelegate = delegate.constructor.navigationDelegate;
      const events = navigationDelegate._events;

      setTimeout(() => {
        if (events && events.length) {
          events.forEach((eventName) => {
            if (!this[`_${eventName}Sub`]) {
              this._addListener(eventName, delegate);
            }
          });
        }
      }, 300);
    }
  }

  componentWillMount() {
    const { delegate } = this.props;

    if (delegate) {
      const navigationDelegate = delegate.constructor.navigationDelegate;

      if (navigationDelegate && navigationDelegate.id) {
        const navigationDelegateCopy = Object.assign({},
          delegate.constructor.navigationDelegate);

        const navigationEvents = ['onSceneWillFocus', 'onSceneDidFocus'];

        navigationEvents.forEach((eventName) =>
          this._addListener(eventName, delegate));

        if (delegate['onSceneWillFocus']) {
          delegate['onSceneWillFocus']();
        }

        setTimeout(() => {
          const events = delegate.constructor.navigationDelegate._events;
          navigationDelegateCopy._events = events;

          if (events && events.length) {
            this._events = events.slice();

            this._events.forEach((eventName) => {
              this._addListener(eventName, delegate);
            });
          }
        }, 300);

        const delegateUnmountHandler = delegate.componentWillUnmount;

        Object.defineProperty(delegate, 'componentWillUnmount', {
          writable: false,
          configurable: true,
          enumerable: false,
          value: () => {
            delegateUnmountHandler && delegateUnmountHandler.bind(delegate)()

            navigationEvents.forEach((eventName) =>
              this._removeListener(eventName, delegate))

            const events = this._events;

            if (events && events.length) {
              events.forEach((eventName) => this._removeListener(eventName));
            }

            this._events = null;

            // restore here because we might change it by navBar.updateUI etc...
            delegate.constructor.navigationDelegate = navigationDelegateCopy;
          },
        });
      }
    }
  }

  _addListener = (eventName, delegate) => {
    const navigationContext = delegate.props.navigator.navigationContext;
    const delegateId = delegate.constructor.navigationDelegate.id;

    const formatEventName = (eventName) => {
      if (eventName === 'onSceneWillFocus') {
        return 'willfocus';
      } else if (eventName === 'onSceneDidFocus') {
        return 'didfocus';
      }

      return eventName;
    }

    this[`_${eventName}Sub`] = navigationContext.addListener(
      formatEventName(eventName),
      ({data: {route, e}}) => {
        if (delegateId === route.component.navigationDelegate.id && delegate[eventName]) {
          delegate[eventName](e);
        }
      }
    );
  }

  _removeListener = (eventName) => {
    this[`_${eventName}Sub`].remove();
    delete this[`_${eventName}Sub`];
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
