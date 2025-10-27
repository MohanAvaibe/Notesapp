import React, { use, useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import DrawNotes from "./draw_notes.screen";
import { IconButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

const { width } = Dimensions.get("window");

export default function NoteComposerScreen() {
  const [blocks, setBlocks] = useState([
    { id: Date.now(), type: "text", content: "" },
  ]);
  const [strokeColor, setStrokeColor] = useState("#25A7DA");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [penType, setPenType] = useState("pen"); // "pen" | "marker" | "highlighter" | "eraser"
  const scrollViewRef = useRef(null);
  const editorRef = useRef(null);
  const [currentBlock, setCurrentBlock] = useState("text");

  const addBlock = (type) => {
    setBlocks([...blocks, { id: Date.now(), type, content: "" }]);
    setCurrentBlock(type);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const updateBlock = (id, newContent) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  const pickImage = async (id) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      updateBlock(id, result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        scrollEnabled={currentBlock !== "draw"}
        ref={scrollViewRef}
      >
        {blocks.map((block) => (
          <View key={block.id} style={styles.block}>
            {block.type === "text" && (
              <>
                <RichEditor
                  ref={editorRef}
                  initialContentHTML="<ul><li></li></ul>"
                />
              </>
            )}

            {block.type === "draw" && (
              <DrawNotes
                onChange={(path) => updateBlock(block.id, path)}
                penType={penType}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
              />
            )}

            {block.type === "image" && (
              <View style={styles.imageBlock}>
                {block.content ? (
                  <Image source={{ uri: block.content }} style={styles.image} />
                ) : (
                  <Button
                    title="Upload Image"
                    onPress={() => pickImage(block.id)}
                  />
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      {currentBlock === "text" && (
        <View style={styles.controls}>
          <View style={styles.penRow}>
            <RichToolbar
              editor={editorRef}
              actions={[
                actions.setBold,
                actions.setItalic,

                actions.alignCenter,
                actions.alignLeft,
                actions.alignRight,
                actions.fontSize,
                actions.insertLink,
                actions.setUnderline,
                actions.table,
                actions.insertBulletsList,
              ]}
            />
          </View>
        </View>
      )}

      {currentBlock === "draw" && (
        <View style={styles.controls}>
          <View style={styles.penRow}>
            {["pen", "marker", "highlighter", "eraser"].map((type = "pen") => (
              <IconButton
                selected={penType === type}
                key={type}
                containerColor={penType === type ? "#fafafa83" : "#ffffff"}
                icon={
                  type === "eraser"
                    ? "eraser"
                    : type === "marker"
                    ? "marker"
                    : type === "highlighter"
                    ? "brush"
                    : "pen"
                }
                onPress={() => setPenType(type)}
              />
            ))}
          </View>

          {/* Color palette */}
          {penType !== "eraser" && (
            <View style={styles.colorRow}>
              {[
                "#000000",
                "#FF0000",
                "#25A7DA",
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
          {/* <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btn} onPress={handleUndo}>
              <Text style={styles.btnText}>Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleClear}>
              <Text style={styles.btnText}>Clear</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      )}

      {/* Floating Toolbar */}
      <View style={styles.toolbar}>
        <IconButton
          color="orange"
          icon="pen"
          onPress={() => addBlock("text")}
        />
        <IconButton
          color="orange"
          icon="draw"
          onPress={() => addBlock("draw")}
        />

        <IconButton
          color="orange"
          icon="image"
          onPress={() => addBlock("image")}
        />
      </View>
    </View>
  );
}

/* ─────────────── Styles ─────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    padding: 16,
  },
  block: {
    marginBottom: 20,
  },
  textInput: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    fontSize: 16,
    backgroundColor: "transparent",
    minHeight: 50,
  },
  imageBlock: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  image: {
    width: width - 50,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  canvasWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    height: 500,
  },
  canvas: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  toolBtn: {
    padding: 10,
  },
  toolText: {
    fontSize: 24,
  },
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
