import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

const PopupMenu = ({ abVisible, children }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (abVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 150,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0); // reset scale to 0 when hidden
    }
  }, [abVisible]);

  if (!abVisible) {
    return null; // or return <></> to unmount while invisible
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        zIndex: 999,
        position: "absolute",
        margin: 25,
        right: 0,
        bottom: 80,
        borderRadius: 1000,
        backgroundColor: "tomato",
      }}
    >
      {children}
    </Animated.View>
  );
};

export default PopupMenu;
