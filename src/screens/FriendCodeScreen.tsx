import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser?: User;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

const FriendCodeScreen = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const friendsData: User[] = [];
      for (const friendId of user.following) {
        const q = query(collection(db, 'users'), where('id', '==', friendId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          friendsData.push(snapshot.docs[0].data() as User);
        }
      }
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'friendRequests'),
        where('toUserId', '==', user.id),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const requests: FriendRequest[] = [];
      
      for (const doc of snapshot.docs) {
        const requestData = doc.data() as FriendRequest;
        requestData.id = doc.id;
        
        const userQ = query(collection(db, 'users'), where('id', '==', requestData.fromUserId));
        const userSnapshot = await getDocs(userQ);
        if (!userSnapshot.empty) {
          requestData.fromUser = userSnapshot.docs[0].data() as User;
        }
        
        requests.push(requestData);
      }
      
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      const q = query(
        collection(db, 'users'),
        where('friendCode', '==', searchQuery.toUpperCase())
      );
      const snapshot = await getDocs(q);
      const results: User[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data() as User;
        if (userData.id !== user?.id) {
          results.push(userData);
        }
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendFriendRequest = async (toUser: User) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUserId: user.id,
        toUserId: toUser.id,
        status: 'pending',
        createdAt: new Date(),
      });
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (request: FriendRequest) => {
    if (!user || !request.fromUser) return;

    try {
      await deleteDoc(doc(db, 'friendRequests', request.id));
      Alert.alert('Success', `You are now friends with ${request.fromUser.displayName}!`);
      loadFriendRequests();
      loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const renderFriend = ({ item }: { item: User }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.displayName}</Text>
        <Text style={styles.friendCode}>{item.friendCode}</Text>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <Icon name="chatbubble" size={20} color="#0066cc" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: User }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.displayName}</Text>
        <Text style={styles.friendCode}>{item.friendCode}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => sendFriendRequest(item)}
      >
        <Icon name="person-add" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.fromUser?.displayName || 'Unknown'}</Text>
        <Text style={styles.friendCode}>{item.fromUser?.friendCode || ''}</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => acceptFriendRequest(item)}
        >
          <Icon name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestButton, styles.declineButton]}
          onPress={() => deleteDoc(doc(db, 'friendRequests', item.id))}
        >
          <Icon name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friend Codes</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter friend code (SW-XXXX-XXXX-XXXX)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchUsers}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
            <Icon name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'friends' && (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No friends yet. Start by searching for friend codes!</Text>
          }
        />
      )}

      {activeTab === 'requests' && (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending friend requests</Text>
          }
        />
      )}

      {activeTab === 'search' && (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            searchQuery && <Text style={styles.emptyText}>No users found with that friend code</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E60012',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#E60012',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#E60012',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  friendCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  messageButton: {
    padding: 10,
  },
  addButton: {
    backgroundColor: '#E60012',
    borderRadius: 20,
    padding: 8,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  requestActions: {
    flexDirection: 'row',
  },
  requestButton: {
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#00CC66',
  },
  declineButton: {
    backgroundColor: '#FF3333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});

export default FriendCodeScreen;