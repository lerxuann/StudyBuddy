import { View, Text, ScrollView, Image, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { Button } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from "../../contexts/auth";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function MatchScreen() {
  const [profiles, setProfiles] = useState([]);
  const { user } = useAuth();
  const [major, setMajor] = useState(null);
  const [name, setName] = useState('');
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Step 2: Create a state variable to handle refreshing

  useEffect(() => {
    //fetch major of user
    const fetchMajor = async () => {
      const { data, error } = await supabase.from('user_profiles')
        .select('major').eq('user_id', user.id);

      if (error) {
        console.error(error);
      } else {
        setMajor(data[0].major);
      }
    };
    //fetch name of user
    const fetchName = async () => {
      const { data, error } = await supabase.from('user_profiles')
        .select('name')
        .eq('user_id', user.id);

      if (error) {
        console.error(error);
      } else {
        setName(data[0].name);
      }
    };

    fetchName();
    fetchMajor();
  }, []);

    //fetch profiles of all other users with the same major as user
    const fetchMatchingProfiles = async () => {
      const { data, error } = await supabase.from('user_profiles')
        .select('*').neq('user_id', user.id).eq('major', major);

      if (error) {
        console.error(error);
      } else {
        setProfiles(data);
      }
    };

    fetchMatchingProfiles();

  //insert/update chatrooms
  const startChat = async (receiverId, receiverName) => {
    let firstParticipant, secondParticipant;
    if (user.id < receiverId) {
      firstParticipant = user.id;
      secondParticipant = receiverId;
    } else {
      firstParticipant = receiverId;
      secondParticipant = user.id;
    }

    let currentTime = new Date();

    const { error } = await supabase.from("chats")
      .upsert(
        { participants_id: [firstParticipant, secondParticipant], receiver_name: receiverName, sender_name: name, created_at: currentTime },
        { onConflict: 'participants_id' } //making sure that chats are unique between two unique individuals
      ).select();

    if (error) {
      console.error(error);
    }
    router.replace('/chat');
  };

const renderProfileItem = ({ item }) => (
      <View style={{ padding: 10, backgroundColor: 'pink', alignItems: 'center' }}>
        <View style={{alignItems: 'center'}}>
        <Image source={{ uri: item.image_url }} 
        style={{ height: 170, width: 170, borderRadius: 85, borderWidth: 1, borderColor: 'white', marginBottom: 10}} />
        </View>
        <Text>Name: {item.name}</Text>
        <Text>Year of Study: {item.year_of_study}</Text>
        <Text>Major: {item.major}</Text>
        <Text>Modules: {item.modules}</Text>
        <Text>Description: {item.description}</Text>
        <TouchableOpacity onPress={() => startChat(item.user_id, item.name)} style = {{backgroundColor: 'pink', padding: 8}}>
          <Text style = {{color: "rebeccapurple", fontSize: 15, fontWeight: 500}}>  
            Study Together?
          </Text>
        </TouchableOpacity>
      </View>
    );
  
    const handleHelpIconPress = () => {
      setShowHelpModal(true); //open modal when help icon is pressed
    };
  
    const handleCloseHelpModal = () => {
      setShowHelpModal(false); //exit modal
    };

    const onRefresh = async () => { //handle refresh
    setIsRefreshing(true);

    try {
      await fetchMatchingProfiles(); // Call the function to fetch profiles
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
        <View style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
          <TouchableOpacity onPress={handleHelpIconPress} style={{padding: 10}}>
            <Ionicons name="help-circle-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {profiles.length ? (
          //usual view
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
            {profiles.map((profile, index) => (
              <View key={index}>
                {renderProfileItem({ item: profile })}
              </View>
            ))}
          </ScrollView>
        ) : (
          //if no other users with same major
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
            <Text>We cannot find other users with the same major as you :(</Text>
            <Text>Try again later!</Text>
          </View>
        )}
        <Modal visible={showHelpModal} animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'mistyrose' }}>
          <Text style={{ textAlign: 'center', marginBottom: 5, padding:10, fontSize: 20, fontWeight: 'bold' }}>
            Welcome to the Match page!
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 5, padding: 10 }}>
            This is where you will be shown other users who take the same major as you
          </Text>
          <Text style={{ textAlign: 'center', padding: 10 }}>
            If you click the Study together? button, it starts a chat with the user, which you can use to get to know each other and arrange your study sessions!
          </Text>
          <Button onPress={() => handleCloseHelpModal()}>Got it!</Button>
          </View>
        </Modal>
      </View>
    );
  }