
import React, { PureComponent } from 'react';
import { TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

type Props = {
    children: Object,
    onPress: () => any,
    style?: ComponentStyles
};

export default class ImageButton extends PureComponent<Props> {
    render() {
        const { onPress } = this.props;
        const image = require('../../assets/threeDots.png');
        return (
            <TouchableOpacity
              onPress={onPress}
              style={styles.imageBackground}>
              <ImageBackground
                source={image}
                style={styles.imageContent}>
              </ImageBackground>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    imageBackground: {
      width:50, height: 20, marginTop: 10,
      borderColor: '#edf1f5', borderWidth: 1, backgroundColor: '#edf1f5',
      justifyContent: 'center', alignItems: 'center'
    },
    imageContent: {
      width: 16, height: 16
    }
});
