import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Progress from 'react-native-progress'

const DATA = [
  {
    id: 1,
    title: "First Item",
  },
  {
    id: 2,
    title: "Second Item",
  },
  {
    id: 3,
    title: "Third Item",
  },
];

const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <Pressable onPress={onPress} style={[styles.item, backgroundColor]}>
    <Text style={[styles.title, textColor]}>{item.title}</Text>
    <Progress.Bar progress={ 0.4 } width={ null } style={{ marginTop: 5 }}/>
  </Pressable>
);

const App = () => {

  const renderItem = ({ item }) => {

    return (
      <Item
        item={item}
        backgroundColor= "white"
        textColor= "black"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
  },
  progressBar: {
    marginTop: 5,
    height: 20,
    width: '100%',
    backgroundColor: 'white',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: "row",
  },
  progressText: {
    flex: 1,
    textAlign: "right",
    paddingRight: 4,
  }
});

export default App;