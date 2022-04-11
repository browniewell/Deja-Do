import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function TodoListItem({item, deleteItem, updateItem}) {
  return (
    <View style={styles.item}>
      <MaterialIcon
        name="refresh"
        size={25}
        style={styles.refreshIcon}
        onPress={() => updateItem(item)}
      />
      <Pressable
        style={({pressed}) => [{opacity: pressed ? 0.5 : 1.0}, {flex: 1}]}
        onPress={() => console.log(`Tapped ${item.title}`)}
        onLongPress={() => editOrDelete(item.key, item.title, deleteItem)}>
        <Text style={styles.title}>{item.title}</Text>
        <Progress.Bar
          progress={item.getProgress()}
          width={null}
          style={styles.progressBar}
        />
        <View style={styles.dateLine}>
          <Text style={styles.daysRemaining}>
            {item.daysRemaining} {daysRemainingMessage(item.daysRemaining)}
          </Text>
          <Text style={styles.dueDate}>{item.dueDate.toDateString()}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const editOrDelete = (key, title, deleteItem) => {
  Alert.alert(
    'Edit or Delete',
    `Would you like to edit or delete "${title}"?`,
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Edit', onPress: () => console.log(`Edit ${title}`)},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteItem(key),
      },
    ],
  );
};

const daysRemainingMessage = numDays => {
  if (numDays === 1) return 'Day Remaining';
  else return 'Days Remaining';
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
    marginVertical: 5,
    marginRight: 15,
    marginLeft: 5,
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    color: 'black',
  },
  progressBar: {
    marginTop: 5,
  },
  dateLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  dueDate: {
    // textAlign: "right",
    // marginTop: 3
  },
  daysRemaining: {
    // textAlign: "left",
    // marginTop: 3
  },
});
