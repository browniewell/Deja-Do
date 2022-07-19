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

export default function TodoListItem({item, renewItem, editItem}) {
  return (
    <View style={styles.item}>
      <Pressable
        hitSlop={5}
        style={({pressed}) => [{opacity: pressed ? 0.5 : 1.0}]}
        onPress={() => renewItem(item)}>
        <MaterialIcon
          name={item.isRecurring ? 'refresh' : 'done'}
          size={25}
          style={styles.refreshIcon}
        />
      </Pressable>
      <Pressable
        style={({pressed}) => [{opacity: pressed ? 0.5 : 1.0}, {flex: 1}]}
        onPress={() => {
          editItem(item);
        }}>
        <Text style={styles.title}>{item.title}</Text>
        <Progress.Bar
          progress={getProgress(item)}
          width={null}
          color={getProgressBarColor(item)}
          style={styles.progressBar}
        />
        <View style={styles.dateLine}>
          <Text style={styles.daysRemaining}>
            {daysRemainingMessage(item.daysRemaining)}
          </Text>
          <Text style={styles.dueDate}>
            {new Date(item.dueDate).toDateString()}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const getProgress = function (item) {
  function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  }

  function daysBetween(start, end) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    var daysBetween =
      (treatAsUTC(end) - treatAsUTC(start)) / millisecondsPerDay;
    return daysBetween;
  }

  // FIXME: If the due date is farther out than the current date plus the interval, the
  // progress bar will be empty until that is no longer the case. This is only applicable on the first occurrence.
  item.daysRemaining = daysBetween(Date.now(), item.dueDate);
  var progress;

  // Covers the case where a single-use item was created/edited to have a due-date in the past
  // (including the current day), which would result in a negative interval
  if (item.interval <= 0) {
    progress = 1;
  } else {
    if (item.intervalUnits == 'days') {
      progress = (item.interval - item.daysRemaining) / item.interval;
    } else if (item.intervalUnits == 'weeks') {
      progress = (item.interval * 7 - item.daysRemaining) / (item.interval * 7);
    } else if (item.intervalUnits == 'months') {
      // Not all months are 30 days, but we're doing this just to make things easier.
      // It shouldn't make a big difference as far as the progress bar is concerned (1/30 of the bar)
      // FIXME: Figure out a way to get accurate monthly item progress
      progress =
        (item.interval * 30 - item.daysRemaining) / (item.interval * 30);
    } else {
      progress = (item.interval - item.daysRemaining) / item.interval;
    }
  }

  // Add 1 to days remaining to account for the midnight due date
  item.daysRemaining = Math.floor(item.daysRemaining) + 1;

  return progress;
};

const getProgressBarColor = function (item) {
  // console.log(`Days Remaining: ${item.daysRemaining}`);
  if (item.daysRemaining <= 2 && item.daysRemaining > 0) {
    // Yellow
    return 'rgba(255, 204, 0, 1)';
  } else if (item.daysRemaining == 0) {
    // Green
    return 'rgba(76, 217, 100, 1)';
  } else if (item.daysRemaining < 0) {
    // Red
    return 'rgba(255, 59, 48, 1)';
  } else {
    // Blue
    return 'rgba(0, 122, 255, 1)';
  }
};

const daysRemainingMessage = numDays => {
  let pluralString = Math.abs(numDays) === 1 ? 'Day' : 'Days';
  if (numDays < 0) {
    return `${Math.abs(numDays)} ${pluralString} Overdue`;
  } else {
    return `${numDays} ${pluralString} Remaining`;
  }
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
