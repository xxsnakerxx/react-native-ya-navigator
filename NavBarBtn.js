import React from 'react-native';

const {
  StyleSheet,
  PropTypes,
  View,
  Text,
  TouchableOpacity,
} = React;

export default class NavBarBtn extends React.Component {
  render() {
    const {
      style,
      side,
      onPress,
      text,
      textStyle,
    } = this.props;

    const alignment =
      (side === 'left') ?
        styles.navBarLeftButton :
        styles.navBarRightButton;

    if (text) {
      return (
        <TouchableOpacity
          style={alignment}
          onPress={onPress}>
          <Text style={[styles.navBarButtonText, textStyle]}>{text}</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity
          style={style}
          onPress={onPress}>
          {this.props.children}
        </TouchableOpacity>
      )
    }
  }

  static propTypes = {
    side: PropTypes.oneOf(['left', 'right']),
    style: View.propTypes.style,
    textStyle: Text.propTypes.style,
    text: PropTypes.string,
    onPress: PropTypes.func.isRequired,
  };
}

const styles = StyleSheet.create({
  navBarLeftButton: {
    paddingRight: 10,
  },
  navBarRightButton: {
    paddingLeft: 10,
  },
  navBarButtonText: {
    fontSize: 16,
  },
})
