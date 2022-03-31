import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Progress from 'react-native-progress'

export default function TodoListItem({ item }){

    return (
        <Pressable style={ styles.item }>
          <Text style={ styles.title }>{ item.title }</Text>
          <Progress.Bar progress={ item.getProgress() } width={ null } style={ styles.progressBar }/>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    item: {
      padding: 10,
      marginVertical: 8,
      marginHorizontal: 16,
      color: "white"
    },
    title: {
      fontSize: 18,
      color: "black"
    },
    progressBar: {
      marginTop: 5
    }
  });
  