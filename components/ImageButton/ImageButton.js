
import React, { PureComponent } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type Props = {
    children: React$Element,
    onPress: () => any,
    style?: ComponentStyles
};

export default class ImageButton extends PureComponent<Props> {
    render() {
        const { onPress } = this.props;
        const image = 'ellipsis-h';
        return (
            <TouchableOpacity
              onPress={onPress}
              style={styles.imageBackground}>
              <Icon name={image} size={20} />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    imageBackground: {
      width:50,
      height: 20,
      marginTop: 10,
      borderColor: '#edf1f5',
      borderWidth: 1,
      backgroundColor: '#edf1f5',
      justifyContent: 'center',
      alignItems: 'center'
    }
});
