import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, KeyboardAvoidingView, Platform, Modal, ScrollView, Image } from 'react-native';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";
import { useLocalSearchParams, Link } from 'expo-router';
import { Button } from 'react-native-paper';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [name, setName] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [otherId, setOtherId] = useState(null);
  const { user } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { chatId, receiverName } = useLocalSearchParams();

  const fetchChatHistory = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
    } else {
      setMessages(data);
    }
  };

  const fetchName = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
    } else {
      setName(data[0].name);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchName(), fetchChatHistory(), fetchOtherId()]);
  };
  
  // fetching the other id to allow user to view the profile of their studybuddy 
  const fetchOtherId = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('participants_id')
      .eq('chat_id', chatId);
    if (error) {
      console.error(error);
    } else {
      const [participantId1, participantId2] = data[0].participants_id;
      if (user.id == participantId1) {
        setOtherId(participantId2);
      } else {
        setOtherId(participantId1);
      }
    }
  }

  // fetching the profile of the user's studybuddy
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', otherId);

    if (error) {
      console.error(error);
    } else {
      setProfiles(data);
    }
  };
  
  useEffect(() => {
    const timer = setInterval(() => {
      handleRefresh();
    }, 1000); // Refresh 

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { error } = await supabase.from('chat_messages').insert([
      { chat_id: chatId, sender_id: name, message: newMessage.trim() },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      // Update the messages state with the new message
      const newMessageObj = { sender_id: name, message: newMessage.trim() };
      setMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage('');
    }
  };

  const handleHelpIconPress = () => {
    fetchProfiles();
    setShowHelpModal(true);
  };

  const handleCloseHelpModal = () => {
    setShowHelpModal(false);
  };


const renderProfileItem = ({ item }) => (
    <SafeAreaView style={{ padding: 30, backgroundColor: 'pink', marginTop: 30 }}>
      <View style={{alignItems: 'center'}}>
        <Image source={{ uri: item.image_url }} 
        style={{ height: 170, width: 170, borderRadius: 85, borderWidth: 2, borderColor: 'lavenderblush',}} />
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Name</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.name}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Year Of Study</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.year_of_study}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Major</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.major}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Modules</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, paddingRight: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.modules}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Description</Text>
          <View style={{ height: 120, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, paddingRight: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.description}</Text>
          </View>
      </View>
    </SafeAreaView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 16, backgroundColor: 'pink' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      
      <View style={{ marginBottom: 0, marginTop: 25 }}>
        <Link href="/chat">
          <Button>Back</Button>
        </Link>
      </View>

      <View style={{ marginBottom: 8, marginTop: 2, alignItems: 'center' }}>
        <Button  style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }} onPress={() => {handleHelpIconPress()}}>
        <Text style = {{color: "black", fontSize: 18, fontWeight: 'bold'}}>  
        {receiverName}
          </Text></Button>
      </View>

<FlatList
       // formatting the chat messages 
        data={messages}
        renderItem={({ item }) =>
          messages.length > 0 && (
            <View
              style={{
                marginBottom: 8,
                marginTop: 8,
                alignSelf: item.sender_id === name ? 'flex-end' : 'flex-start',
                paddingHorizontal: 16,
                maxWidth: '80%',
              }}
            >
              <Text
                style={{
                  textAlign: item.sender_id === name ? 'left' : 'left',
                  backgroundColor: item.sender_id === name ? '#DCF8C6' : '#F1F0F0',
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                {item.message}
              </Text>
              <Text
                style={{
                  textAlign: item.sender_id === name ? 'right' : 'left',
                  marginTop: 4,
                  fontSize: 12,
                  color: 'gray',
                }}
              >
                {moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Text>
            </View>
          )
        }
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
      />
      <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 30 }}>
        <TextInput
          style={{
            flex: 1,
            marginRight: 8,
            padding: 10,
            borderWidth: 1,
            maxHeight: 100,
            backgroundColor: 'lavenderblush',
          }}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline={true}
        />
        <Button onPress={handleSendMessage}>Send</Button>
      </View>  
      <Modal visible={showHelpModal} animationType="slide">
        <ScrollView style = {{backgroundColor: "pink"}}>
          {profiles.map(profile => (
            <View key={profile.id.toString()}>
              {renderProfileItem({ item: profile })}
            </View>
          ))}
          <Button onPress={() => handleCloseHelpModal()}>Got it!</Button>
        </ScrollView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ChatMessages;