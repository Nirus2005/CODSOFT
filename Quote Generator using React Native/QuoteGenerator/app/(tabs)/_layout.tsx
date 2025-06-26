import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ToastAndroid, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as SystemUI from "expo-system-ui";
import * as Clipboard from 'expo-clipboard';


const App = () => {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync("#000");
    randomQuote();
  }, []);

  const [Quote, setQuote] = useState('Loading...');
  const [Author, setAuthor] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(false);
  const randomQuote = () => {
    fetch("http://api.quotable.io/random")
      .then((res) => res.json())
      .then((result) => {
        setQuote(result.content);
        setAuthor(result.author);
        setIsLoading(false); 
      })
      .catch((error) => {
        console.error("Fetch failed:", error);
        setIsLoading(false); 
    });
  };

  const copyToClip= () => {
    Clipboard.setStringAsync(Quote); 
    if (Platform.OS === 'android') {
      ToastAndroid.show('Quote copied!', ToastAndroid.SHORT);
    }
    }

  return (
    <View
      style={{ 
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
      }}
    >
      <View
        style={{
          width: "90%",
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 26,
            fontWeight: "600",
            color: "#333",
            marginBottom: 20,
          }}
        >
          Quote of the Day
        </Text>
        <FontAwesome
          name="quote-left"
          style={{ fontSize: 20, color: "#000", marginBottom: -12 }}
        ></FontAwesome>
        <Text
          style={{
            color: "#000",
            fontSize: 16,
            lineHeight: 26,
            letterSpacing: 1.1,
            fontWeight: "400",
            textAlign: "center",
            marginBottom: 10,
            paddingHorizontal: 30,
          }}
        >
          {Quote}
        </Text>
        <FontAwesome
          name="quote-right"
          style={{
            fontSize: 20,
            color: "#000",
            textAlign: "right",
            marginTop: -20,
            marginBottom: 20,
          }}
        ></FontAwesome>
        <Text
          style={{
            textAlign: "right",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#000",
            fontSize: 16,
          }}
        >
          — {Author}
        </Text>
        <TouchableOpacity
          onPress={randomQuote}
          style={{
            backgroundColor: isLoading?'rgba(255, 170, 0, 0.7)': 'rgba(255, 170, 0, 1)',
            padding: 20,
            borderRadius: 30,
            marginVertical: 20,
          }}
        >
          <Text  style={{ color: "white", fontSize: 18, textAlign: "center" }}>
            {isLoading? "Loading...": "New Quote"}
          </Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            onPress={copyToClip}
            style={{
              borderWidth: 2,
              borderColor: "orange",
              borderRadius: 50,
              padding: 15,
            }}
          >
            <FontAwesome name="copy" size={22} color="orange"></FontAwesome>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default App;
