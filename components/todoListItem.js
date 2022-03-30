import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Progress from 'react-native-progress'

export default function TodoListItem({ item }){

    return (
        <Pressable style={[styles.item, "white" ]}>
          <Text style={[styles.title, "black" ]}>{item.title}</Text>
          <Progress.Bar progress={ item.getProgress() } width={ null } style={{ marginTop: 5 }}/>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    item: {
      padding: 10,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 18,
    }
  });
  