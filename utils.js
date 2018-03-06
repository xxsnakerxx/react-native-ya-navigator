import React from 'react';

import {
  Dimensions,
  Platform,
} from 'react-native';

const getNavigationDelegate = (component) => (component.wrappedComponent && component.wrappedComponent.navigationDelegate) ||
    component.navigationDelegate ||
    (component.type && component.type.navigationDelegate);

const getOrientation = () => {
  const { width, height } = Dimensions.get('window');

  return height > width ? 'PORTRAIT' : 'LANDSCAPE';
};

const replaceInstanceEventedProps =
  (reactElement, eventedProps, events = [], route, navigationContext) => {
    eventedProps.forEach((eventedProp) => {
      if (React.isValidElement(reactElement) && reactElement.props[eventedProp]) {
        const event = reactElement.props[eventedProp]();

        if (typeof event === 'string') {
          if (events.indexOf(event) < 0) {
            events.push(event);
          }

          reactElement = React.cloneElement(reactElement, {
            [eventedProp]: (e) => navigationContext.emit(event, { route, e }),
          });
        }
      }
    });

    return { reactElement, events };
  };


const isIphoneX = () => {
  const { width, height } = Dimensions.get('window');

  return (
      Platform.OS === 'ios' &&
      !Platform.isPad &&
      !Platform.isTVOS &&
      (height === 812 || width === 812)
  );
}

const getNavigationOption = (route, option) => {
  return route && route.component &&
    getNavigationDelegate(route.component) &&
    getNavigationDelegate(route.component)[option];
}

export {
  getNavigationDelegate,
  getNavigationOption,
  getOrientation,
  replaceInstanceEventedProps,
  isIphoneX,
};
