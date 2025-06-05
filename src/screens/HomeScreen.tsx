import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const features = [
    {
      icon: 'game-controller',
      title: 'Friend Codes',
      description: 'Share and discover friend codes',
      color: '#E60012',
      screen: 'Friends',
    },
    {
      icon: 'people',
      title: 'Communities',
      description: 'Join gaming communities',
      color: '#0066cc',
      screen: 'Communities',
    },
    {
      icon: 'calendar',
      title: 'Game Sessions',
      description: 'Schedule gaming sessions',
      color: '#FF9900',
      screen: 'Communities',
    },
    {
      icon: 'cart',
      title: 'Marketplace',
      description: 'Trade games and items',
      color: '#00CC66',
      screen: 'Market',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.displayName || 'Player'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Icon name="person-circle" size={40} color="#E60012" />
          </TouchableOpacity>
        </View>

        <View style={styles.friendCodeCard}>
          <Text style={styles.friendCodeLabel}>Your Friend Code</Text>
          <Text style={styles.friendCode}>{user?.friendCode || 'SW-0000-0000-0000'}</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share-social" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              onPress={() => navigation.navigate(feature.screen as never)}
            >
              <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
                <Icon name={feature.icon} size={30} color="white" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>No recent activity</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 5,
  },
  friendCodeCard: {
    backgroundColor: '#E60012',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  friendCodeLabel: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  friendCode: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  shareButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  featureCard: {
    width: '45%',
    backgroundColor: 'white',
    padding: 20,
    margin: '2.5%',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  activityText: {
    color: '#666',
  },
});

export default HomeScreen;