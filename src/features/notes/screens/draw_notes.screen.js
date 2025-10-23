import React, { useState, useRef } from "react";
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import Slider from "@react-native-community/slider";
import { Buffer } from "buffer";

const { width, height } = Dimensions.get("window");

export default function DrawNotes() {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [penType, setPenType] = useState("pen"); // "pen" | "marker" | "highlighter" | "eraser"

  const canvasRef = useRef(null);

  //   const handleTouchStart = (x, y) => {
  //     const path = Skia.Path.Make();
  //     path.moveTo(x, y);
  //     setCurrentPath({
  //       path,
  //       color: penType === "eraser" ? "#fafafa" : strokeColor,
  //       strokeWidth:
  //         penType === "marker"
  //           ? strokeWidth * 1.5
  //           : penType === "highlighter"
  //           ? strokeWidth * 3
  //           : strokeWidth,
  //       blendMode: penType === "highlighter" ? "multiply" : "srcOver",
  //     });
  //   };

  //   const handleTouchMove = (x, y) => {
  //     if (!currentPath) return;
  //     currentPath.path.lineTo(x, y);
  //     setCurrentPath({ ...currentPath });
  //   };

  //   const handleTouchEnd = () => {
  //     if (currentPath) {
  //       if (currentPath.points.length === 1) {
  //         const pt = currentPath.points[0];
  //         const dotPath = Skia.Path.Make();
  //         dotPath.addCircle(pt.x, pt.y, currentPath.strokeWidth / 2);
  //         currentPath.path = dotPath;
  //       }
  //       setPaths([...paths, currentPath]);
  //       setCurrentPath(null);
  //     }
  //   };

  const handleTouchStart = (x, y) => {
    const path = Skia.Path.Make();
    path.moveTo(x, y);
    setCurrentPath({
      path,
      color: penType === "eraser" ? "#fafafa" : strokeColor,
      strokeWidth:
        penType === "marker"
          ? strokeWidth * 1.5
          : penType === "highlighter"
          ? strokeWidth * 3
          : strokeWidth,
      blendMode: penType === "highlighter" ? "multiply" : "srcOver",
      points: [{ x, y }], // Track points
    });
  };

  const handleTouchMove = (x, y) => {
    if (!currentPath) return;
    currentPath.path.lineTo(x, y);
    currentPath.points.push({ x, y }); // Add point on move
    setCurrentPath({ ...currentPath });
  };

  const handleTouchEnd = () => {
    if (currentPath) {
      if (currentPath.points.length === 1) {
        // If only one point, draw a dot
        const pt = currentPath.points[0];
        const dotPath = Skia.Path.Make();
        dotPath.addCircle(pt.x, pt.y, currentPath.strokeWidth / 2);
        currentPath.path = dotPath;
      }
      setPaths([...paths, currentPath]);
      setCurrentPath(null);
    }
  };

  const handleClear = () => setPaths([]);

  const handleUndo = () => setPaths(paths.slice(0, -1));

  const handleSaveImage = async () => {
    const fileName = String(Date.now());
    const folder = "Notes";

    canvasRef.current?.save("png", false, folder, fileName, true, false, false);
  };

  return (
    <View style={styles.container}>
      <Canvas
        ref={canvasRef}
        style={styles.canvas}
        onTouchStart={(e) =>
          handleTouchStart(e.nativeEvent.locationX, e.nativeEvent.locationY)
        }
        onTouchMove={(e) =>
          handleTouchMove(e.nativeEvent.locationX, e.nativeEvent.locationY)
        }
        onTouchEnd={handleTouchEnd}
      >
        {[...paths, currentPath].map(
          (p, i) =>
            p && (
              <Path
                key={i}
                path={p.path}
                color={p.color}
                strokeWidth={p.strokeWidth}
                style="stroke"
                strokeJoin="round"
                strokeCap="round"
                blendMode={p.blendMode || "srcOver"}
              />
            )
        )}
      </Canvas>

      {/* Pen Controls */}
      <View style={styles.controls}>
        <View style={styles.penRow}>
          {["pen", "marker", "highlighter", "eraser"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.penButton, penType === type && styles.activePen]}
              onPress={() => setPenType(type)}
            >
              <Text style={styles.penText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color palette */}
        {penType !== "eraser" && (
          <View style={styles.colorRow}>
            {[
              "#000000",
              "#FF0000",
              "#00BFFF",
              "#008000",
              "#FFA500",
              "#800080",
            ].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  {
                    backgroundColor: color,
                    borderWidth: strokeColor === color ? 2 : 0,
                  },
                ]}
                onPress={() => setStrokeColor(color)}
              />
            ))}
          </View>
        )}

        {/* Stroke width */}
        <View style={styles.sliderRow}>
          <Text style={{ width: 70 }}>✏️ {strokeWidth}px</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={strokeWidth}
            onValueChange={setStrokeWidth}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btn} onPress={handleUndo}>
            <Text style={styles.btnText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleClear}>
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSaveImage} style={styles.btn}>
          <Text style={styles.btnText}>Save Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  canvas: { flex: 1 },
  controls: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  penRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  penButton: {
    padding: 6,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  activePen: { backgroundColor: "#007AFF" },
  penText: { color: "#000" },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  btn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: { color: "white", fontWeight: "bold" },
});
