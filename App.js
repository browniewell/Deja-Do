import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Progress from 'react-native-progress'
import TodoListItem from "./components/todoListItem";


class TodoItem{
  constructor(title, daysRemaining, totalDuration){
    this.title = title;
    this.daysRemaining = daysRemaining;
    this.totalDuration = totalDuration;
  }

  getProgress(){
    return (this.totalDuration - this.daysRemaining) / this.totalDuration;
  }
}

const App = () => {
  const [todos, setTodos] = useState([
    new TodoItem("First Item", 10, 14),
    new TodoItem("Second Item", 1, 3),
    new TodoItem("Third Item", 1, 5)
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ todos }
        renderItem={({ item }) => (
          <TodoListItem item={ item } />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
});

export default App;