import buildStyleInterpolator from 'react-native/Libraries/Utilities/buildStyleInterpolator';

import {
  PixelRatio,
  Dimensions,
  Platform,
} from 'react-native';

// eslint-disable-next-line
import FBNavigator from './FBNavigator';

let sceneConfig = FBNavigator.SceneConfigs.PushFromRight;

const outAnimation = {
  transformTranslate: {
    from: { x: 0, y: 0, z: 0 },
    to: { x: -Math.round(Dimensions.get('window').width * 0.3), y: 0, z: 0 },
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PixelRatio.get(),
  },
  transformScale: {
    value: { x: 1, y: 1, z: 1 },
    type: 'constant',
  },
  opacity: {
    value: 1.0,
    type: 'constant',
  },
  translateX: {
    from: 0,
    to: -Math.round(Dimensions.get('window').width * 0.3),
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PixelRatio.get(),
  },
  scaleX: {
    value: 1,
    type: 'constant',
  },
  scaleY: {
    value: 1,
    type: 'constant',
  },
};

const intoAnimation = {
  opacity: {
    value: 1.0,
    type: 'constant',
  },

  transformTranslate: {
    from: { x: Dimensions.get('window').width, y: 0, z: 0 },
    to: { x: 0, y: 0, z: 0 },
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PixelRatio.get(),
  },

  translateX: {
    from: Dimensions.get('window').width,
    to: 0,
    min: 0,
    max: 1,
    type: 'linear',
    extrapolate: true,
    round: PixelRatio.get(),
  },

  scaleX: {
    value: 1,
    type: 'constant',
  },
  scaleY: {
    value: 1,
    type: 'constant',
  },
};

const CustomPushFromRight = {
  ...sceneConfig,
  animationInterpolators: {
    out: buildStyleInterpolator(outAnimation),
    into: buildStyleInterpolator(intoAnimation),
  },
};

export {
  CustomPushFromRight,
};

export default sceneConfig = Platform.OS === 'ios' ?
  CustomPushFromRight :
  FBNavigator.SceneConfigs.FadeAndroid;
