import { Dimensions } from 'react-native';

const getNavigationDelegate = (component) => {
  return component.navigationDelegate ||
    (component.type && component.type.navigationDelegate)
}

const getOrientation = () => {
  const { width, height } = Dimensions.get('window');

  return height > width ? 'PORTRAIT' : 'LANDSCAPE';
}

export {
  getNavigationDelegate,
  getOrientation,
}
