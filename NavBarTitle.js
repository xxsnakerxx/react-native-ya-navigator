import React from 'react-native';

const {
  StyleSheet,
  PropTypes,
  Text,
  TouchableOpacity,
} = React;

export default class NavBarTitle extends React.Component {
  render() {
    let child;

    const {
      text,
      textStyle,
      onPress,
    } = this.props;

    if (text) {
      child = <Text style={[styles.navBarTitleText, textStyle]}>{text}</Text>
    } else {
      child = this.props.children;
    }

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress}>
          {child}
        </TouchableOpacity>
      )
    } else {
      return child;
    }
  }

  static propTypes = {
    text: PropTypes.string,
    textStyle: Text.propTypes.style,
    onPress: PropTypes.func,
  };
}

const styles = StyleSheet.create({
  navBarTitleText: {
    fontSize: 18,
  },
})
